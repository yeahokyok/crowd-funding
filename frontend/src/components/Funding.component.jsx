import { useContractReads } from 'wagmi'
import {
    chakra,
    Box,
    Stack,
    Text,
    Image,
    Container,
    Button,
    ButtonProps,
    useColorModeValue,
    Progress,
} from '@chakra-ui/react'
import { TimeIcon } from '@chakra-ui/icons'
import { crowdFundingContract } from '../constants'

const Funding = () => {
    const { data } = useContractReads({
        contracts: [
            {
                ...crowdFundingContract,
                functionName: 'goal',
            },
        ],
    })

    return (
        <Container p={{ base: 5, md: 10 }}>
            <Box
                borderWidth="1px"
                _hover={{ shadow: 'lg' }}
                rounded="md"
                overflow="hidden"
                bg={useColorModeValue('white', 'gray.800')}
            >
                <Image
                    src="https://blog.ferplast.com/wp-content/uploads/2021/03/gatti-corrono-per-casa-motivi-1024x683.jpg"
                    objectFit="cover"
                    w="100%"
                />
                <Box p={{ base: 3, sm: 5 }}>
                    <Box mb={6}>
                        <chakra.h3
                            fontSize={{ base: 'lg', sm: '2xl' }}
                            fontWeight="bold"
                            lineHeight="1.2"
                            mb={2}
                        >
                            2022 Senior Cat Rescue Marathon
                        </chakra.h3>
                        <Text fontSize={{ base: 'md', sm: 'lg' }} noOfLines={2}>
                            On Sunday November 20 (my 60th birthday), I will run
                            the Ninth Annual New York Cat Hospital SENIOR CAT
                            RESCUE MARATHON!
                        </Text>
                    </Box>
                    <Box>
                        <Progress value={80} />
                    </Box>
                    <Box>
                        <TimeIcon /> 15 days left.
                    </Box>

                    <Stack
                        justify="space-between"
                        direction={{ base: 'column', sm: 'row' }}
                        spacing={{ base: 2, sm: 0 }}
                    >
                        <CustomButton variant="outline">
                            Not a member?
                        </CustomButton>
                        <CustomButton colorScheme="teal" variant="solid">
                            Access Now
                        </CustomButton>
                    </Stack>
                </Box>
            </Box>
        </Container>
    )
}

const CustomButton = ({ children, ...props }) => {
    return (
        <Button
            textTransform="uppercase"
            lineHeight="inherit"
            rounded="md"
            {...props}
        >
            {children}
        </Button>
    )
}
export default Funding
