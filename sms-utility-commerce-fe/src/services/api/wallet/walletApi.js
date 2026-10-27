import { baseApi } from '../baseApi'

// Payment seam for Hubtel and Paystack. The browser settles locally in settleTopUp
// until this can initialize a charge and complete it from a verified webhook.
export const walletApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
})
