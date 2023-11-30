// Next 13+

// На проекте использовал Beta директорию /app
// Авторизация на стороне Next сервера (Next Auth)
// Chakra UI, как UI библа

// Пример написания SSR компонента

// [page.tsx]

// Здесь генерирую meta данные, с помощью зарезервированной функции generateMetadata(), для оптимизации SEO

// Получаю бренды с бека и прокидываю в client компонент, как пропс


import { Metadata } from 'next'
import { BrandsItemsPage } from './BrandsItemsPage'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Бренды',
    alternates: {
      canonical: `${process.env.SITE}brands/`,
    },
    openGraph: {
      title: 'Бренды',
      description: 'Список брендов',
      type: 'website',
      locale: 'ru_RU',
      siteName:
        'MILAVITSA: Интернет-магазин нижнего белья, одежды и аксессуаров',
    },
  }
}

const fetchBrands = async () => {
  const res = await fetch(`${process.env.API_URL}/store/brands/all`)
  const brands = await res.json()
  return brands
}

export default async function ItemPage() {
  const { result } = await fetchBrands()

  return (
    <>
      <BrandsItemsPage brands={result} />
    </>
  )
}


