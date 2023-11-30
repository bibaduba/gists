'use client'

import { Link } from '@chakra-ui/next-js'
import { Center, Container, Heading } from '@chakra-ui/react'
import { PrimaryButton } from '../components/PrimaryButton'

export default function NotFound() {
  return (
    <Container h='full'>
      <Center py={['44']} flexDir='column' gap='6'>
        <Heading as='h1' fontSize='5xl' fontWeight='400' textAlign='center'>
          Страница не найдена
        </Heading>
        <Link href='/' w={['full', null, '50%']} display='flex' alignItems='center'>
          <PrimaryButton w='50%' m='0 auto'>
            На главную
          </PrimaryButton>
        </Link>
      </Center>
    </Container>
  )
}
