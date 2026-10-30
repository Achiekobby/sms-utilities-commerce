import axios from 'axios'
import { env } from '../../config/env'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { Accept: 'application/json' },
})

function isJwt(token) {
  return typeof token === 'string' && token.split('.').length === 3
}

export async function axiosBaseQuery(args, api) {
  const token = api.getState().auth?.token
  const headers = { ...(args.headers ?? {}) }

  if (isJwt(token)) headers.Authorization = `Bearer ${token}`
  if (typeof FormData !== 'undefined' && args.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    const response = await http.request({
      url: args.url,
      method: args.method ?? 'GET',
      data: args.body,
      params: args.params,
      headers,
      timeout: args.timeout,
    })

    if (response.data?.in_error) {
      return {
        error: {
          status: Number(response.data.status_code) || 400,
          data: response.data,
        },
      }
    }

    return { data: response.data }
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      return { error: { status: 'FETCH_ERROR', data: error.message } }
    }

    return {
      error: {
        status: error.response.status,
        data: error.response.data,
      },
    }
  }
}
