import { ethers } from 'ethers'
import { useContractReads, useBalance } from 'wagmi'
import {
    chakra,
    Box,
    Text,
    Image,
    Container,
    useColorModeValue,
    Progress,
    Spacer,
    Flex,
} from '@chakra-ui/react'
import { TimeIcon } from '@chakra-ui/icons'

import Contribute from './Contribute.component'
import { crowdFundingContract } from '../constants'

const Funding = () => {
    console.log('Funding')
    const { data: contractBalance } = useBalance({
        address: crowdFundingContract.address,
    })

    const { data } = useContractReads({
        contracts: [
            {
                ...crowdFundingContract,
                functionName: 'goal',
            },
            {
                ...crowdFundingContract,
                functionName: 'deadline',
            },
            {
                ...crowdFundingContract,
                functionName: 'MINIMUM_CONTRIBUTION',
            },
        ],
    })
    const [goalInWei, deadline, minimumContributionInWei] = data
    const goal = ethers.utils.formatUnits(goalInWei)
    const minimumContribution = ethers.utils.formatUnits(
        minimumContributionInWei,
    )

    const today = Date.now() / 1000
    const timeLeft = deadline - today
    const daysLeft = Math.floor(timeLeft / 86400)
    const progress = (contractBalance.value * 100) / goalInWei

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
                        <Progress value={progress} />
                        <Flex>
                            <Box>
                                {contractBalance?.formatted}{' '}
                                {contractBalance?.symbol}
                            </Box>
                            <Spacer />
                            <Box>
                                {goal} {contractBalance?.symbol}
                            </Box>
                        </Flex>
                    </Box>
                    <Box>
                        <TimeIcon /> {daysLeft} days left.
                    </Box>
                </Box>
                <Contribute />
            </Box>
        </Container>
    )
}

export default Funding
