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
    username: String
    location: String
    avatarUploadUuid: ID
    lastSeenAt: Date
  }

  type Community {
    uuid: String
    name: String
    tagline: String
    desc: String
    location: String
    tier: CommunityTier
    visibility: CommunityType
    Users: [UserDetails]
  }

  type PopularCommunity {
    uuid: String
    name: String
    tagline: String
    desc: String
    location: String
    userCount: Int
  }

  type Query {
    getLoggedInUserDetails : LoggedInUserDetails
    getUserDetailsByUuid(uuid: ID!): UserDetails
    getLoggedInUserCommunities: [Community]
    getUserCommunitiesByUuid(uuid: ID!): [Community]
    searchCommunities(name: String!): [Community]
    popularCommunities: [PopularCommunity]
  }

  type Mutation {
    createCommunity(
      name: String,
      tagline: String,
      desc: String,
      location: String,
      tier: CommunityTier,
      visibility: CommunityType,
      ) : Community
    login(email: String!, password: String!) : LoggedInUserDetails!
  }
`;
