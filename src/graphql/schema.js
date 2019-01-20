import { gql } from 'apollo-server-express';

export default gql`
  scalar Date

  enum CommunityTier {
    free
    tier1
    tier2
    tier3
  }

  enum CommunityType {
    public
    private
    secret
  }

  enum ConversationCategoryType {
    public
    private
    secret
  }

  enum ConversationCategoryRole {
    guest
    member
    moderator
    admin
  }

  enum UploadedItemType {
    user_avatar
    community_avatar
    post_attachment
  }

  type LoggedInUserDetails {
    uuid: ID!
    email: String!
    username: String
    firstName: String
    lastName: String
    userAttributes: String
    location: String
    avatarUploadUuid: ID
    lastSeenAt: Date
    token: String
  }

  type UserDetails {
    uuid: ID!
    firstName: String
    lastName: String
    username: String
    location: String
    avatarUploadUuid: ID
    lastSeenAt: Date
    CommunityUser: CommunityUser
  }

  type Community {
    uuid: String
    name: String
    tagline: String
    desc: String
    location: String
    tier: CommunityTier
    visibility: CommunityType
    users: [UserDetails]
  }

  type CommunityUser {
    communityUuid: String
    userUuid: String
    status: String
    role: String
  }

  type PopularCommunity {
    uuid: String
    name: String
    tagline: String
    desc: String
    location: String
    userCount: Int
  }

  type Message {
    channelUuid: String
    uuid: String
    sender: UserDetails
    text: String
    createdAt: Date
  }

  type Channel {
    communityUuid: String
    uuid: String
    name: String
    desc: String
  }

  type ChannelMessages {
    nextCursor: Int
    messages: [Message]
  }

  type Query {
    getChannels(communityUUID: String!): [Channel]
    getMessagesForChannel(channelUUID: String!, cursor: Int): ChannelMessages
    getCommunityMembers(uuid: ID!): Community
    getLoggedInUserDetails: LoggedInUserDetails
    getUserDetailsByUuid(uuid: ID!): UserDetails
    getLoggedInUserCommunities: [Community]
    getUserCommunitiesByUuid(uuid: ID!): [Community]
    searchCommunities(name: String!): [Community]
    searchUsers(queryText:String!): [UserDetails]
    popularCommunities: [PopularCommunity]
  }

  type Mutation {
    createCommunity(
      name: String
      tagline: String
      desc: String
      location: String
      tier: CommunityTier
      visibility: CommunityType
    ): Community
    createUser(
      email: String
      password: String
      username: String
      firstName: String
      lastName: String
      userAttributes: String
      location: String
    ): UserDetails
    sendMessage(
      channelUUID: String
      senderUUID: String,
      text: String,
    ): Message

    login(email: String!, password: String!) : LoggedInUserDetails!
    signup(
      email: String!, 
      password: String!, 
      captchaResponse: String!
    ): String
  }  

  type Subscription {
    messageSent(channelUUID: String!): Message
  }
`;
