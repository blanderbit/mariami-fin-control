/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CodeConfirm {
  /**
   * Verify code
   * @minLength 5
   * @maxLength 5
   */
  verify_code: string;
}

export interface ValidateResetPasswordCode {
  /**
   * Verify code
   * @minLength 5
   * @maxLength 5
   */
  verify_code: string;
}

export interface Login {
  /**
   * Email
   * @format email
   * @minLength 3
   * @maxLength 255
   */
  email: string;
  /**
   * Password
   * @minLength 8
   * @maxLength 68
   */
  password: string;
  /** Tokens */
  tokens?: object;
}

export interface Logout {
  /**
   * Refresh
   * @minLength 1
   */
  refresh: string;
}

export interface RequestChangePassword {
  /**
   * New password
   * @minLength 8
   * @maxLength 68
   */
  new_password: string;
  /**
   * Old password
   * @minLength 8
   * @maxLength 68
   */
  old_password: string;
}

export interface RequestPasswordReset {
  /**
   * Email
   * @format email
   * @minLength 3
   * @maxLength 255
   */
  email: string;
}

export interface ResetPassword {
  /**
   * New password
   * @minLength 8
   * @maxLength 68
   */
  new_password: string;
  /**
   * Verify code
   * @minLength 5
   * @maxLength 5
   */
  verify_code: string;
}

export interface TokenRefresh {
  /**
   * Refresh
   * @minLength 1
   */
  refresh: string;
  /**
   * Access
   * @minLength 1
   */
  access?: string;
}

export interface Registration {
  /**
   * Email
   * @format email
   * @minLength 1
   * @maxLength 255
   */
  email: string;
  /**
   * Password
   * @minLength 8
   * @maxLength 68
   */
  password: string;
  /**
   * Re password
   * @minLength 8
   * @maxLength 68
   */
  re_password: string;
}

export interface Onboarding {
  /**
   * Name
   * @maxLength 255
   */
  name?: string | null;
  /**
   * Last name
   * @maxLength 255
   */
  last_name?: string | null;
  /**
   * Country
   * @maxLength 255
   */
  country?: string | null;
  /**
   * Company name
   * @maxLength 255
   */
  company_name?: string | null;
  /**
   * Employees count
   * @min 0
   * @max 2147483647
   */
  employees_count?: number | null;
  /**
   * Industry
   * @maxLength 255
   */
  industry?: string | null;
  /**
   * Currency
   * Primary business currency
   */
  currency?:
    | "USD"
    | "EUR"
    | "GBP"
    | "CAD"
    | "AUD"
    | "JPY"
    | "CHF"
    | "SEK"
    | "NOK"
    | "DKK"
    | null;
  /**
   * Fiscal year start
   * Fiscal year start date
   * @format date
   */
  fiscal_year_start?: string | null;
  /** Update frequency */
  update_frequency?: "daily" | "weekly" | "monthly" | null;
  /** Primary focus */
  primary_focus?: "cash" | "profit" | "growth" | null;
  /**
   * Business model
   * @maxLength 255
   */
  business_model?: string | null;
  /** Multicurrency */
  multicurrency?: boolean;
  /**
   * Capital reserve target
   * Target amount for capital reserves
   * @format decimal
   */
  capital_reserve_target?: string | null;
  /**
   * Current cash
   * Current cash available
   * @format decimal
   */
  current_cash?: string | null;
}

export interface GetMyProfile {
  /** ID */
  id?: number;
  /** Profile */
  profile?: string;
  /** Uploaded files */
  uploaded_files?: string;
  /**
   * Last login
   * @format date-time
   */
  last_login?: string | null;
  /**
   * Email
   * @format email
   * @minLength 1
   * @maxLength 255
   */
  email: string;
  /** Is verified */
  is_verified?: boolean;
  /** Is admin */
  is_admin?: boolean;
  /** Is onboarded */
  is_onboarded?: boolean;
  /**
   * Created at
   * @format date-time
   */
  created_at?: string;
  /**
   * Updated at
   * @format date-time
   */
  updated_at?: string;
}

export interface UsersList {
  /** ID */
  id?: number;
  /**
   * Last login
   * @format date-time
   */
  last_login?: string | null;
  /**
   * Email
   * @format email
   * @minLength 1
   * @maxLength 255
   */
  email: string;
  /** Is verified */
  is_verified?: boolean;
  /** Is admin */
  is_admin?: boolean;
  /** Is onboarded */
  is_onboarded?: boolean;
  /**
   * Created at
   * @format date-time
   */
  created_at?: string;
  /**
   * Updated at
   * @format date-time
   */
  updated_at?: string;
  /** Profile */
  profile?: number | null;
}

export interface UploadUserDataResponse {
  /** Success */
  success: boolean;
  /**
   * Message
   * @minLength 1
   */
  message: string;
  uploaded_files?: Record<string, string | null>[];
  errors?: string[];
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://0.0.0.0:8000/api/v1",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title MariaMi
 * @version 0.0.1
 * @baseUrl http://0.0.0.0:8000/api/v1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description This endpoint allows the user to: confirm changing the password,, email, account verification, as well as deleting the account using the previously received code that comes to the mail
     *
     * @tags auth
     * @name AuthCodeConfirmCreate
     * @summary Сode confirmations
     * @request POST:/auth/code/confirm
     * @secure
     */
    authCodeConfirmCreate: (data: CodeConfirm, params: RequestParams = {}) =>
      this.request<CodeConfirm, any>({
        path: `/auth/code/confirm`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint allows the user to check the password reset code for validity before using it
     *
     * @tags auth
     * @name AuthConfirmationCodeValidateCreate
     * @summary Validate reset password code
     * @request POST:/auth/confirmation/code/validate
     * @secure
     */
    authConfirmationCodeValidateCreate: (
      data: ValidateResetPasswordCode,
      params: RequestParams = {},
    ) =>
      this.request<ValidateResetPasswordCode, any>({
        path: `/auth/confirmation/code/validate`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint allows a previously registered user to log in to the system.
     *
     * @tags auth
     * @name AuthLoginCreate
     * @summary Login
     * @request POST:/auth/login
     * @secure
     */
    authLoginCreate: (data: Login, params: RequestParams = {}) =>
      this.request<Login, any>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint allows a previously registered user to logout from the system
     *
     * @tags auth
     * @name AuthLogoutCreate
     * @summary Logout
     * @request POST:/auth/logout
     * @secure
     */
    authLogoutCreate: (data: Logout, params: RequestParams = {}) =>
      this.request<Logout, any>({
        path: `/auth/logout`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This class allows an authorized user to request a password change. After submitting the application, a confirmation code will be sent. to the email address provided by the user.
     *
     * @tags auth
     * @name AuthPasswordChangeCreate
     * @summary Request change password
     * @request POST:/auth/password/change
     * @secure
     */
    authPasswordChangeCreate: (
      data: RequestChangePassword,
      params: RequestParams = {},
    ) =>
      this.request<RequestChangePassword, any>({
        path: `/auth/password/change`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This class allows an unauthorized user to request a password reset. After submitting the application, a confirmation code will be sent to the email specified by the user.
     *
     * @tags auth
     * @name AuthPasswordResetCreate
     * @summary Request password reset
     * @request POST:/auth/password/reset
     * @secure
     */
    authPasswordResetCreate: (
      data: RequestPasswordReset,
      params: RequestParams = {},
    ) =>
      this.request<RequestPasswordReset, any>({
        path: `/auth/password/reset`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This class makes it possible to confirm a password reset request using the code that was sent to the mail after the request was sent.
     *
     * @tags auth
     * @name AuthPasswordResetConfirmCreate
     * @summary Confirm password reset
     * @request POST:/auth/password/reset/confirm
     * @secure
     */
    authPasswordResetConfirmCreate: (
      data: ResetPassword,
      params: RequestParams = {},
    ) =>
      this.request<ResetPassword, any>({
        path: `/auth/password/reset/confirm`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Refresh jwt tokens
     *
     * @tags auth
     * @name AuthRefreshCreate
     * @request POST:/auth/refresh
     * @secure
     */
    authRefreshCreate: (data: TokenRefresh, params: RequestParams = {}) =>
      this.request<TokenRefresh, any>({
        path: `/auth/refresh`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Registration This endpoint allows any user to register on the site.
     *
     * @tags auth
     * @name AuthRegistrationCreate
     * @request POST:/auth/registration
     * @secure
     */
    authRegistrationCreate: (data: Registration, params: RequestParams = {}) =>
      this.request<Registration, any>({
        path: `/auth/registration`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  profile = {
    /**
     * @description Get list of all supported currencies
     *
     * @tags profile
     * @name ProfileCurrenciesList
     * @request GET:/profile/currencies
     * @secure
     */
    profileCurrenciesList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/profile/currencies`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Update profile data during onboarding process
     *
     * @tags profile
     * @name ProfileOnboardingPartialUpdate
     * @request PATCH:/profile/onboarding
     * @secure
     */
    profileOnboardingPartialUpdate: (
      data: Onboarding,
      params: RequestParams = {},
    ) =>
      this.request<Onboarding, any>({
        path: `/profile/onboarding`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get current onboarding status and profile data
     *
     * @tags profile
     * @name ProfileOnboardingStatusList
     * @request GET:/profile/onboarding/status
     * @secure
     */
    profileOnboardingStatusList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: Onboarding[];
        },
        any
      >({
        path: `/profile/onboarding/status`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint allows an authorized user to get detailed information about their profile,
     *
     * @tags profile
     * @name ProfileProfileList
     * @summary User personal profile
     * @request GET:/profile/profile
     * @secure
     */
    profileProfileList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: GetMyProfile[];
        },
        any
      >({
        path: `/profile/profile`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description This class makes it possible to get a list of all users of the application.
     *
     * @tags users
     * @name UsersAdminUsersList
     * @summary List of users
     * @request GET:/users/admin/users
     * @secure
     */
    usersAdminUsersList: (
      query?: {
        /**
         * EN - This option allows you to filter the list of         users
         * Records are filtered by the fields:         email
         *
         *  RU - Эта опция позволяет фильтровать список         пользователей
         * Записи фильтруются по полям:         email
         */
        search?: string;
        /**
         * EN - This option allows you to sort the list of         users
         *
         *  RU - Эта опция позволяет вам сортировать список         пользователей
         */
        ordering?: "id" | "-id";
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: UsersList[];
        },
        any
      >({
        path: `/users/admin/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersClientUsersIsAdminList
     * @request GET:/users/client/users/is-admin
     * @secure
     */
    usersClientUsersIsAdminList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/users/client/users/is-admin`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Get P&L analysis for a specific date range. This endpoint: 1. Fetches user's P&L data for the specified period 2. Returns the filtered P&L data as a list 3. Calculates total revenue (sum of Revenue column) 4. Calculates total expenses (sum of all expenses fields) 5. Calculates net profit (revenue - expenses) 6. Provides 1-month and 1-year comparison with percentage changes The response includes: - pnl_data: Array of P&L records for the requested period - total_revenue: Sum of all revenue for the period - total_expenses: Sum of all expense categories for the period - net_profit: Total revenue minus total expenses - month_change: Comparison with same period 1 month ago - year_change: Comparison with same period 1 year ago
     *
     * @tags users
     * @name GetPnlAnalysis
     * @request GET:/users/pnl-analysis
     * @secure
     */
    getPnlAnalysis: (
      query: {
        /**
         * Start date for analysis period (YYYY-MM-DD format)
         * @format date
         * @example "2024-01-01"
         */
        start_date: string;
        /**
         * End date for analysis period (YYYY-MM-DD format)
         * @format date
         * @example "2024-12-31"
         */
        end_date: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/users/pnl-analysis`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload user data files (P&L, Transactions, Invoices)
     *
     * @tags File Upload
     * @name UsersUploadDataFilesCreate
     * @request POST:/users/upload/data-files
     * @secure
     */
    usersUploadDataFilesCreate: (
      data: {
        /**
         * P&L template file
         * @format binary
         */
        pnl_file?: File;
        /**
         * Transactions template file
         * @format binary
         */
        transactions_file?: File;
        /**
         * Invoices template file
         * @format binary
         */
        invoices_file?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<UploadUserDataResponse, void>({
        path: `/users/upload/data-files`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
}
