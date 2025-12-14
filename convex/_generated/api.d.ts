/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as gifts from "../gifts.js";
import type * as guestAuth from "../guestAuth.js";
import type * as guests from "../guests.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as stripe from "../stripe.js";
import type * as stripeActions from "../stripeActions.js";
import type * as twilioActions from "../twilioActions.js";
import type * as users from "../users.js";
import type * as weddings from "../weddings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  gifts: typeof gifts;
  guestAuth: typeof guestAuth;
  guests: typeof guests;
  http: typeof http;
  leads: typeof leads;
  "lib/authorization": typeof lib_authorization;
  stripe: typeof stripe;
  stripeActions: typeof stripeActions;
  twilioActions: typeof twilioActions;
  users: typeof users;
  weddings: typeof weddings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
