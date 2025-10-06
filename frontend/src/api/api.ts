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

export interface AIInsightsResponse {
  /**
   * List of exactly 4 AI-generated business insights
   * @maxItems 4
   * @minItems 4
   */
  insights: string[];
  /**
   * Period
   * Analysis period information
   */
  period: Record<string, string | null>;
  /**
   * Data sources
   * Available data sources used for analysis
   */
  data_sources: Record<string, string | null>;
}

export interface CashAnalysisResponse {
  /**
   * Total income
   * Total income from transactions
   * @format decimal
   */
  total_income: string;
  /**
   * Total expense
   * Total expense from transactions
   * @format decimal
   */
  total_expense: string;
}

export interface DocumentsList {
  /**
   * Terms of service
   * Public URL for Terms of Service document
   * @format uri
   * @minLength 1
   */
  terms_of_service?: string | null;
  /**
   * Privacy policy
   * Public URL for Privacy Policy document
   * @format uri
   * @minLength 1
   */
  privacy_policy?: string | null;
}

export interface IndustriesList {
  /** List of available industries from Industry_norms.csv */
  industries: string[];
}

export interface IndustryDetails {
  /**
   * Industry
   * Industry name
   * @minLength 1
   * @maxLength 255
   */
  industry: string;
  /**
   * Gross margin range
   * Gross margin range for the industry
   * @maxLength 50
   */
  gross_margin_range?: string;
  /**
   * Operating margin range
   * Operating margin range for the industry
   * @maxLength 50
   */
  operating_margin_range?: string;
  /**
   * Cash buffer target months
   * Recommended cash buffer in months
   * @maxLength 50
   */
  cash_buffer_target_months?: string;
  /**
   * Dso range
   * Days Sales Outstanding range
   * @maxLength 50
   */
  dso_range?: string;
  /**
   * Inventory days range
   * Inventory days range
   * @maxLength 50
   */
  inventory_days_range?: string;
  /**
   * Expense mix notes
   * Notes about expense mix for the industry
   * @maxLength 500
   */
  expense_mix_notes?: string;
  /**
   * Notes
   * Additional notes about the industry
   * @maxLength 500
   */
  notes?: string;
  /**
   * Source refs
   * Source references
   * @maxLength 200
   */
  source_refs?: string;
}

/** Metrics for paid invoices */
export interface InvoiceMetrics {
  /**
   * Total count
   * Total number of invoices
   */
  total_count: number;
  /**
   * Total amount
   * Total amount of invoices
   */
  total_amount: number;
}

/** Change in total invoice count */
export interface ChangeData {
  /**
   * Change
   * Absolute change value
   */
  change: number;
  /**
   * Percentage change
   * Percentage change value
   */
  percentage_change: number;
}

/** Changes in paid invoices metrics */
export interface InvoiceChangeMetrics {
  /** Change in total invoice count */
  count_change: ChangeData;
  /** Change in total invoice count */
  amount_change: ChangeData;
}

/** Month-over-month changes */
export interface PeriodChange {
  /** Change in total invoice count */
  total_count: ChangeData;
  /** Changes in paid invoices metrics */
  paid_invoices: InvoiceChangeMetrics;
  /** Changes in paid invoices metrics */
  overdue_invoices: InvoiceChangeMetrics;
}

/** Analysis period information */
export interface PeriodInfo {
  /**
   * Start date
   * Analysis period start date
   * @format date
   */
  start_date: string;
  /**
   * End date
   * Analysis period end date
   * @format date
   */
  end_date: string;
}

export interface InvoicesAnalysisResponse {
  /**
   * Total count
   * Total number of invoices in the period
   */
  total_count: number;
  /** Metrics for paid invoices */
  paid_invoices: InvoiceMetrics;
  /** Metrics for paid invoices */
  overdue_invoices: InvoiceMetrics;
  /** Month-over-month changes */
  month_change: PeriodChange;
  /** Month-over-month changes */
  year_change: PeriodChange;
  /** Analysis period information */
  period: PeriodInfo;
}

/** Month-over-month changes */
export interface MonthChange {
  /**
   * Revenue
   * Revenue change data
   */
  revenue: Record<string, string | null>;
  /**
   * Expenses
   * Expenses change data
   */
  expenses: Record<string, string | null>;
  /**
   * Net profit
   * Net profit change data
   */
  net_profit: Record<string, string | null>;
}

/** Year-over-year changes */
export interface YearChange {
  /**
   * Revenue
   * Revenue change data
   */
  revenue: Record<string, string | null>;
  /**
   * Expenses
   * Expenses change data
   */
  expenses: Record<string, string | null>;
  /**
   * Net profit
   * Net profit change data
   */
  net_profit: Record<string, string | null>;
}

/** Analysis period information */
export interface Period {
  /**
   * Start date
   * Analysis period start date
   * @format date
   */
  start_date: string;
  /**
   * End date
   * Analysis period end date
   * @format date
   */
  end_date: string;
}

export interface PNLAnalysisResponse {
  /** Raw P&L data for the period */
  pnl_data: (string | null)[];
  /**
   * Total revenue
   * Total revenue for the period
   * @format decimal
   */
  total_revenue: string;
  /**
   * Total expenses
   * Total expenses for the period
   * @format decimal
   */
  total_expenses: string;
  /**
   * Net profit
   * Net profit (revenue - expenses)
   * @format decimal
   */
  net_profit: string;
  /**
   * Gross margin
   * Gross margin percentage ((Revenue - COGS) / Revenue * 100)
   * @format decimal
   */
  gross_margin: string;
  /**
   * Operating margin
   * Operating margin range from industry standards
   * @minLength 1
   */
  operating_margin?: string | null;
  /** Month-over-month changes */
  month_change: MonthChange;
  /** Year-over-year changes */
  year_change: YearChange;
  /** Analysis period information */
  period: Period;
  /** AI-generated business insights */
  ai_insights: string[];
}

export interface TemplateList {
  /**
   * Pnl
   * Public URL for P&L template
   * @format uri
   * @minLength 1
   */
  pnl?: string | null;
  /**
   * Transactions
   * Public URL for transactions template
   * @format uri
   * @minLength 1
   */
  transactions?: string | null;
  /**
   * Invoices
   * Public URL for invoices template
   * @format uri
   * @minLength 1
   */
  invoices?: string | null;
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
     * @description Generate AI insights by analyzing combined financial data from P&L, invoices, and cash analysis. Returns exactly 4 concise business insights with actionable recommendations. Requires uploaded data files (pnl_template, invoices_template, transactions_template) for comprehensive analysis.
     *
     * @tags AI Analysis
     * @name UsersAiInsightsList
     * @summary Get AI-powered business insights
     * @request GET:/users/ai-insights
     * @secure
     */
    usersAiInsightsList: (
      query: {
        /**
         * Start date for analysis period (YYYY-MM-DD)
         * @format date
         */
        start_date: string;
        /**
         * End date for analysis period (YYYY-MM-DD)
         * @format date
         */
        end_date: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<AIInsightsResponse, void>({
        path: `/users/ai-insights`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Analyze user's transaction data to calculate total income and total expense. Requires transactions_template file to be uploaded. Supports filtering by start_date and end_date.
     *
     * @tags Cash Analysis
     * @name UsersCashAnalysisList
     * @summary Get cash analysis
     * @request GET:/users/cash-analysis
     * @secure
     */
    usersCashAnalysisList: (
      query?: {
        /**
         * Start date (YYYY-MM-DD) for filtering
         * @example "2025-01-01"
         */
        start_date?: string;
        /**
         * End date (YYYY-MM-DD) for filtering transactions
         * @example "2025-01-31"
         */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CashAnalysisResponse, void>({
        path: `/users/cash-analysis`,
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
     * @description Get public URLs for all document files. Returns cached URLs for optimal performance.
     *
     * @tags Documents
     * @name UsersDocumentsList
     * @request GET:/users/documents
     * @secure
     */
    usersDocumentsList: (params: RequestParams = {}) =>
      this.request<DocumentsList, void>({
        path: `/users/documents`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Analyze user's expense data by category for a specific date range. Returns breakdown with total amounts, spike detection, and new category flags. Requires pnl_template file to be uploaded.
     *
     * @tags Expense Analysis
     * @name UsersExpenseBreakdownList
     * @summary Get expense breakdown analysis
     * @request GET:/users/expense-breakdown
     * @secure
     */
    usersExpenseBreakdownList: (
      query: {
        /**
         * Start date for analysis period (YYYY-MM-DD)
         * @format date
         */
        start_date: string;
        /**
         * End date for analysis period (YYYY-MM-DD)
         * @format date
         */
        end_date: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/users/expense-breakdown`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Get list of all available industries from Industry_norms.csv file. Returns cached results for optimal performance (24 hours cache).
     *
     * @tags Industries
     * @name UsersIndustriesList
     * @request GET:/users/industries
     * @secure
     */
    usersIndustriesList: (params: RequestParams = {}) =>
      this.request<IndustriesList, void>({
        path: `/users/industries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get detailed information for a specific industry including margins, cash buffer recommendations, and other financial metrics.
     *
     * @tags Industries
     * @name UsersIndustriesRead
     * @request GET:/users/industries/{industry_name}
     * @secure
     */
    usersIndustriesRead: (
      industryName: string,
      params: RequestParams = {},
    ) =>
      this.request<IndustryDetails, void>({
        path: `/users/industries/${industryName}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Analyze user's invoices data for a specific date range. Returns metrics for paid and overdue invoices with change calculations.
     *
     * @tags Invoices Analysis
     * @name UsersInvoicesAnalysisList
     * @summary Get invoices analysis
     * @request GET:/users/invoices-analysis
     * @secure
     */
    usersInvoicesAnalysisList: (
      query: {
        /**
         * Start date for analysis period (YYYY-MM-DD)
         * @format date
         */
        start_date: string;
        /**
         * End date for analysis period (YYYY-MM-DD)
         * @format date
         */
        end_date: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<InvoicesAnalysisResponse, void>({
        path: `/users/invoices-analysis`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get P&L analysis for a specific date range. This endpoint: 1. Fetches user's P&L data for the specified period 2. Returns the filtered P&L data as a list 3. Calculates total revenue (sum of Revenue column) 4. Calculates total expenses (sum of all expenses fields) 5. Calculates net profit (revenue - expenses) 6. Provides 1-month and 1-year comparison with percentage changes The response includes: - pnl_data: Array of P&L records for the requested period - total_revenue: Sum of all revenue for the period - total_expenses: Sum of all expense categories for the period - net_profit: Total revenue minus total expenses - month_change: Comparison with same period 1 month ago - year_change: Comparison with same period 1 year ago
     *
     * @tags P&L Analysis
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
      this.request<PNLAnalysisResponse, void>({
        path: `/users/pnl-analysis`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get public URLs for all template files (P&L, transactions, invoices). Returns cached URLs for optimal performance.
     *
     * @tags Templates
     * @name UsersTemplatesList
     * @request GET:/users/templates
     * @secure
     */
    usersTemplatesList: (params: RequestParams = {}) =>
      this.request<TemplateList, void>({
        path: `/users/templates`,
        method: "GET",
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
        /**
         * Column name for dates in PnL file
         * @minLength 1
         * @maxLength 100
         */
        pnl_date_column?: string;
        /** List of expense column names */
        pnl_expense_columns?: string[];
        /** List of revenue column names */
        pnl_revenue_columns?: string[];
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
