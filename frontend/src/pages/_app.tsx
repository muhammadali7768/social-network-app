import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import NavigateService from "@/services/navigate";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const { push } = useRouter();
  NavigateService.initNavigate(push);
  return <Component {...pageProps} />
}
