import {
  Fraunces,
  Noto_Serif_Bengali,
  Work_Sans,
  Hind_Siliguri,
  IBM_Plex_Mono,
} from "next/font/google";

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali"],
  weight: ["600", "700"],
  display: "swap",
});

export const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const fontVariables = [
  fraunces.variable,
  notoSerifBengali.variable,
  workSans.variable,
  hindSiliguri.variable,
  plexMono.variable,
].join(" ");
