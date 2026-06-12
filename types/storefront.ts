export type FooterCategoryLink = {
  name: string
  slug: string
  href: string
}

export type CustomerStatus = {
  authenticated: boolean
  user: {
    id: string
    fullName: string | null
  } | null
}
