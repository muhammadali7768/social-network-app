const API_URL: string | undefined =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL; //We can set for development differnt API_URL

export { API_URL };
