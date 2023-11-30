// [BrandsItemsPage.tsx]

// Здесь получаю бренды с сервера, в useEffect их сортирую, фильтрую (Это лучше бы мемоизировать) и отрисовываю

'use client'

import { ApiBrands } from '@/api/brands'
import { Link } from '@chakra-ui/next-js'
import { Container, Flex, Heading, Text, Select, Box } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { CustomBreadcrumb } from '../components/Breadcrumb'
import { SearchInput } from '../components/SearchInput'
import { SecondaryButton } from '../components/SecondaryButton'

type Brands = {
  first_letter: string
  items: ApiBrands.Get['result'][]
}[]

export function BrandsItemsPage({
  brands,
}: {
  brands: ApiBrands.Get['result'][]
}) {
  const [value, setValue] = useState('')

  const [brandsItems, setBrands] = useState<Brands>([])

  const getBrands = async () => {
    const brandsWithFirstLetter = brands?.map((i) => ({
      ...i,
      first_letter: i.name[0],
    }))

    const sortedBrands: Brands = brandsWithFirstLetter
      .map((i) => {
        if (i.name[0] === i.first_letter) {
          return {
            first_letter: i.first_letter,
            items: brands?.filter((item) => item.name[0] === i.first_letter),
          }
        }
      })
      .sort((a, b) =>
        (a?.first_letter as string) > (b?.first_letter as string) ? 1 : -1
      )

    const uniqArray = Object.values(
      sortedBrands.reduce(
        (acc, n) => (
          !acc[n?.items.find((i) => i.id).id] &&
            (acc[n?.items.find((i) => i.id).id] = n),
          acc
        ),
        {}
      )
    )

    setBrands(uniqArray)
  }

  const historyPages = useMemo(
    () => [
      {
        title: 'Бренды',
        link: '/brands',
      },
    ],
    []
  )

  useEffect(() => {
    getBrands()
  }, [])


  return (
    <Container pb='32' px={['4', '4', '70', '70', '70']}>
      <CustomBreadcrumb historyPages={historyPages} />
      <Heading color='h1' as='h1' fontWeight='400' mb='8'>
        Список брендов
      </Heading>
      <Container
        variant='spaceBetween'
        flexDir={['column', 'column', 'column', 'column', 'row']}
        gap='10'
        px='0'
      >
        <SearchInput
          value={value}
          setValue={setValue}
          height='36px'
          w={['100%', '100%', '100%', '100%', '45%']}
          placeholder='Искать бренд'
          callback={() => setValue('')}
        >
          Найти
        </SearchInput>
        <Flex alignItems='center' gap='6'>
          <Text display={['none', 'none', 'none', 'none', 'flex']}>
            Сортировать:
          </Text>
          <Select placeholder='По алфавиту' border='none' w='auto'></Select>
          <SecondaryButton display={['none', 'none', 'none', 'none', 'flex']}>
            Сбросить фильтры
          </SecondaryButton>
        </Flex>
      </Container>
      <Flex
        wrap='wrap'
        justify='space-between'
        align={['center', null, null, 'flex-start', null]}
        gap='2'
        flexDir={['column', null, null, 'row', 'row']}
      >
        {brandsItems.length ? (
          brandsItems
            ?.filter((i) =>
              i.first_letter
                .toLowerCase()
                .includes(value && value[0].toLowerCase())
            )
            .map((i) => (
              <Box key={i.first_letter} w={['full', null, null, '48%', null]}>
                <Heading
                  color='h1'
                  as='h2'
                  fontWeight='400'
                  textAlign='center'
                  pt='12'
                  pb='4'
                >
                  {i.first_letter}
                </Heading>
                <Flex
                  wrap='wrap'
                  gap='12'
                  justify={[
                    'space-between',
                    'space-between',
                    'space-between',
                    'space-between',
                    'start',
                  ]}
                  align='start'
                  w='fit-content'
                  overflow='hidden'
                  margin='0 auto'
                >
                  {i.items
                    ?.filter((i) =>
                      i.name.toLowerCase().includes(value.toLowerCase())
                    )
                    .map((item) => (
                      <Link key={item.id} href={`/brands/${item.id}`}>
                        <Text>{item.name}</Text>
                      </Link>
                    ))}
                </Flex>
              </Box>
            ))
        ) : (
          <Box display='none'>
            {brands.map(({ name, id }) => (
              <Link key={id} href={`/brands/${id}`}>
                <Text>{name}</Text>
              </Link>
            ))}
          </Box>
        )}
      </Flex>
    </Container>
  )
}