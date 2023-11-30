// Пример написания Функционального компонента с применением технологии SSG
// [Models.tsx]

import { Box, Container, Flex } from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useContext, useMemo, useState } from 'react'
import { Header } from '../../../../src/components/header/header'
import { PhonesNavigation } from '../../../../src/components/phonesNavigation/phonesNavigation'
import { SelectedBrand } from '../../../../src/components/selectedBrand/selectedBrand'
import { SearchGroup } from '../../../../src/components/searchGroup/searchGroup'
import { PhoneModel } from '../../../../src/components/phoneModel/phoneModel'
import { Footer } from '../../../../src/components/footer/footer'
import { manufactures as supportedManufacturers } from '../../../../src/content/manufactures'
import {
  getI18nPaths,
  makeStaticProps,
} from '../../../../src/lib/getStatic.js'
import { useTranslation } from 'next-i18next'
import { Contact } from '../../../../src/components/contact/contact'
import { Breadcrumbs } from '../../../../src/components/breadcrumbs/breadcrumbs'
import { useRouter } from 'next/router'
import { PageMeta } from '../../../../src/components/pageMeta/PageMeta'
import { customersObj } from '../../../../customer-config'
import { ConfCtx } from '../../../../src/context/conf'
import { client } from '../../../../src/services/kms.instance'
import { retailersInfo } from '../../../../src/content/retailersInfo'
import type { Language } from '../../../../src/content/locale.interface'
import type { Paths } from '../../../../src/content/paths.interface'
import type { NextPage } from 'next'
import type { PhoneInfo } from '../../../../src/content/models.interface'

const Models: NextPage<{
  id: string
  products: PhoneInfo[]
}> = ({ products, id }) => {
  const { t } = useTranslation('common')
  const { query, push } = useRouter()
  const [filteredProducts, setFilteredProducts] = useState(products)
  const { retailer } = useContext(ConfCtx)
  const [searchValue, setSearchValue] = useState('')

  const phoneSearch = (s: string) =>
    products.filter((p) => {
      const search = `${
        (p.manufacturer ?? '') +
        ' ' +
        (!!p.vanity_name ? `(${p.vanity_name}) ` : '') +
        (p.name ?? '')
      }`
      return search.toLowerCase().includes(s.toLowerCase())
    })

  const filterModels = (s: string) => {
    setFilteredProducts(phoneSearch(s))
  }

  const searchHandleChange = (value: string) => {
    filterModels(value)
    setSearchValue(value)
  }

  const retailerTitle = useMemo(
    () => retailersInfo.find((i) => i.retailer === retailer)?.title,
    [retailer],
  )


  return (
    <>
      <PageMeta
        title={meta({ value: id, retailer: retailerTitle }).model.title}
        description={meta({ value: id }).model.description}
      />
      <Box>
        <Header />
        <Box my={4} ml={[8, 10, 14]}>
          <Breadcrumbs
            list={[
              {
                name: t('support.support', { support: 'common' }),
                link: `/${query.locale}/`,
              },
              { name: t('brand'), link: `/${query.locale}/brands/` },
              { name: t('model') },
            ]}
          />
        </Box>
        <Box>
          <PhonesNavigation
            from='models'
            onBrandClick={() => push(`/${query.locale}/brands/`)}
          />
          <Flex justify='center' pl={4} pb={4}>
            <SelectedBrand title={id} from='brand' />
          </Flex>
          <SearchGroup
            iconWidth={14}
            height={14}
            placeholder={t('selectModel')}
            font='md'
            searchHandle={searchHandleChange}
            searchValue={searchValue}
          />
          <Container variant='models'>
            {products &&
              filteredProducts.map((el) => (
                <PhoneModel
                  imgSrc={`${process.env.imageUrlBase}${el.image_location}`}
                  modelName={
                    (el.manufacturer ?? '') +
                    ' ' +
                    (!!el.vanity_name ? `(${el.vanity_name}) ` : '') +
                    (el.name ?? '')
                  }
                  key={el.id}
                  customerID={el.customerID}
                />
              ))}
          </Container>
          {customersObj[retailer].contactSection && <Contact bgColor='white' />}
          <Footer />
        </Box>
      </Box>
    </>
  )
}

export const getStaticProps: GetStaticProps = makeStaticProps(
  ['header', 'footer', 'common'],
  async ({
    params: { locale, id },
  }: {
    params: { locale: Language, id: string }
  }) => {
    const customer = customersObj[process.env.CUSTOMER].contentCustomerId
    const manufacturer = (await client.manufacturers({
      customer,
    })).find((m) => m.name === id)

    if (!manufacturer) throw new Error('no manufacturer')

    const res = await client.products({
      customer,
      language: locale,
      manufacturerId: manufacturer.id,
    })
    const products = res.map((p) => ({
      id: p.serial,
      customerID: p.reference_id,
      manufacturer: p.product.manufacturer.name,
      vanity_name: p.vanity_name || '',
      name: p.product.name,
      image_location: p.documents && p.documents.main_image,
    })).sort((a, b) => b.id - a.id).filter(({ name }) => !name.toLocaleLowerCase().includes('general'))

    return {
      props: { products, id, locale },
      revalidate: process.env.revalidate || 3600,
    }
  },
)

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = getI18nPaths()

  const { contentCustomerId } = customersObj[process.env.CUSTOMER]
  const manufacturersOfThisCustomer = await client.manufacturers({
    customer: contentCustomerId,
  })

  const manufacturers = manufacturersOfThisCustomer.filter((m) =>
    supportedManufacturers.includes(m.name),
  )


  const paths = locales.reduce<Paths[]>(
    (acc, next) => [
      ...acc,
      ...manufacturers.map((mf) => ({
        params: {
          id: mf.name,
          locale: next.params.locale,
        },
      })),
    ],
    [],
  )

  return {
    paths,
    fallback: false,
  }
}

export default Models