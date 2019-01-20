import type App from '$/lib/app';
import { PubSub, withFilter } from 'graphql-subscriptions';
import uuid from 'uuid';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import validator from 'validator';

import { generateTokenForUser } from '$/passport-auth/lib';
import { RECAPTCHA_API_KEY } from '$/constants';

export const pubsub = new PubSub();

const COMMUNITY_VISIBILITY_PUBLIC = 'public';
const MESSAGES_PAGE_SIZE = 20;

export default (app: App) => {
  const Query = {
    getChannels: (parent: {}, args: {communityUUID: string}) => {
      /* TODO bariscc: check if user has permission */
      return app.models.Channel.findAll({
        where: { community_uuid: args.communityUUID },
      });
    },
    getMessagesForChannel: (parent: {}, args: {channelUUID: string, cursor: number}) => {
      const cursor = args.cursor ? args.cursor : 0;

      return {
        messages: app.models.Message.findAll({
          where: { channel_uuid: args.channelUUID },
          include: [
            {
              model: app.models.User, as: 'sender',
            },
          ],
          offset: MESSAGES_PAGE_SIZE * cursor,
          limit: MESSAGES_PAGE_SIZE,
        }),
        nextCursor: cursor + 1,
      };
    },
    getCommunityMembers: (parent: {}, args: { uuid: uuid }) => {
      // returns community members for given community id
      return app.models.Community.findOne({
        include: [
          {
            model: app.models.User, as: 'users',
          },
        ],
        where: { uuid: args.uuid },
      });
    },
    getLoggedInUserDetails: (parent: {}, args: {}, user: AppUser) => {
      return app.models.User.findOne({
        include: [{ model: app.models.Community }],
        where: { uuid: user.uuid },
      });
    },
    getUserDetailsByUuid: (parent: {}, args: { uuid: uuid }) => {
      return app.models.User.findOne({
        include: [{ model: app.models.Community }],
        where: { uuid: args.uuid },
      });
    },
    getLoggedInUserCommunities: (parent: {}, args: {}, user: AppUser) => {
      // returns user communities
      return app.models.Community.findAll({
        include: [
          {
            model: app.models.User,
            where: { uuid: user.uuid },
          },
        ],
      });
    },
    getUserCommunitiesByUuid: (parent: {}, args: { uuid: uuid }) => {
      // returns public user communities
      return app.models.Community.findAll({
        include: [
          {
            model: app.models.User,
            where: { uuid: args.uuid },
          },
        ],
        where: { visibility: COMMUNITY_VISIBILITY_PUBLIC },
      });
    },
    popularCommunities: () => {
      // returns communities with most members
      return app.models.Community.findAll({
        limit: 10,
        subQuery: false,
        attributes: [
          'uuid',
          'name',
          'tagline',
          'desc',
          'location',
          [app.sequelize.fn('COUNT', 'CommunityUser.userUuid'), 'userCount'],
        ],
        include: [
          {
            model: app.models.CommunityUser,
            attributes: [],
          },
        ],
        where: { visibility: COMMUNITY_VISIBILITY_PUBLIC },
        group: ['uuid'],
        order: [[app.sequelize.literal('"userCount"'), 'DESC']],
      }).map(data => data.toJSON());
    },
    searchCommunities: (parent: {}, args: { name: string }) => app.models.Community.findAll({
      include: [{ model: app.models.User }],
      where: {
        name: {
          $ilike: `%${args.name}%`,
        },
      },
    }),
    searchUsers: (parent: {}, args: { queryText: string }) => {
      const queryTextArray = args.queryText.split(' ');
      const orQuery = queryTextArray.map((text) => {
        return {
          $iLike: `%${text}%`,
        };
      });
      return app.models.User.findAll({
        where: {
          $or: {
            firstName: {
              $or: orQuery,
            },
            lastName: {
              $or: orQuery,
            },
            username: {
              $or: orQuery,
            },
          },
        },
      });
    },
  };
  const Mutation = {
    // creates community and returns it
    createCommunity: (
      parent: {},
      args: {
        name: string,
        tagline: string,
        desc: string,
        location: string,
        tier: string,
        visibility: string,
      },
    ) => {
      // TODO avatarUploadUuid, socialLinks
      return app.models.Community.create({
        uuid: uuid(),
        name: args.name,
        tagline: args.tagline,
        desc: args.desc,
        location: args.location,
        tier: args.tier,
        visibility: args.visibility,
      });
    },
    login: async (parent: {}, args: {
      email: string,
      password: string
    }) => {
      // 1. check if there is a user with that email
      const user = await app.models.User.findOne({
        where: { email: args.email },
      });

      if (!user) {
        throw new Error(`No such user found for email ${args.email}`);
      }
      // 2. check if their password is correct
      let valid = true;

      if (md5(args.password) !== user.passwordHash) {
        valid = false;
      }

      if (!valid) {
        throw new Error('Invalid password');
      }
      // 3. generate the jwt token
      // todo: we have to create variable name like app_secret for second argument.
      const token = jwt.sign({ userId: user.uuid }, 'mustafa');
      // 5. return the user
      return { uuid: user.uuid, email: user.email, token };
    },
    signup: async (parent: {}, args: {
      email: string,
      password: string,
      captchaResponse: string
    }) => {
      // check captcha result before all
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_API_KEY}&response=${args.captchaResponse}`;
      const captchaResult = await axios(verificationUrl).then(response => response.data.success);
      if (!captchaResult) {
        throw new Error('Recaptcha verification failed, please refresh the page and try again.');
      }

      // input validations
      if (!validator.isEmail(args.email)) { throw new Error('E-mail address must be valid.'); }
      if (!validator.isLength(args.password, { min: 6 })) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // check if email already exists
      const exists = await app.models.User.findOne({
        where: { email: args.email },
      });
      if (exists) {
        throw new Error('This e-mail address is already registered');
      }

      // all validations passed, create the user
      const passwordHash = md5(args.password);
      const user = await app.models.User.create({
        uuid: uuid(),
        email: args.email,
        passwordHash,
      });

      return generateTokenForUser(user);
    },
    createUser: (
      parent: {},
      args: {
        email: string,
        password: string,
        username: string,
        firstName: string,
        lastName: string,
        userAttributes: string,
        location: string,
      },
    ) => {
      const passwordHash = md5(args.password);
      return app.models.User.create({
        uuid: uuid(),
        email: args.email,
        passwordHash,
        username: args.username,
        firstName: args.firstName,
        lastName: args.lastName,
        userAttributes: args.userAttributes,
        location: args.location,
        // avatar uuid
        avatarUploadUuid: uuid(),
      });
    },
    // CHAT
    sendMessage: (parent: {}, args: {
      channelUUID: string,
      senderUUID: string,
      text: string,
    }) => {
      /* TODO bariscc: sanitize text */
      const message = app.models.Message.create({
        uuid: uuid(),
        channelUuid: args.channelUUID,
        senderUuid: args.senderUUID,
        text: args.text.slice(0, 100),
      });
      pubsub.publish('MESSAGE_SENT', { messageSent: message });
      return message;
    },
  };

  const Subscription = {
    messageSent: {
      subscribe: withFilter(() => pubsub.asyncIterator('MESSAGE_SENT'), (payload, variables) => {
        return payload.messageSent.channelUUID === variables.channelUUID;
      }),
    },
  };

  return {
    Query,
    Mutation,
    Subscription,
  };
};
