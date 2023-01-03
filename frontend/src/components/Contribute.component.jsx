import { HStack, useNumberInput, Input, Button, Box } from '@chakra-ui/react'
import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { ethers } from 'ethers'
import { crowdFundingContract } from '../constants'

const Contribute = () => {
    const {
        value,
        getInputProps,
        getIncrementButtonProps,
        getDecrementButtonProps,
    } = useNumberInput({
        step: 0.01,
        defaultValue: 0.01,
        min: 0.01,
    })

    const inc = getIncrementButtonProps()
    const dec = getDecrementButtonProps()
    const input = getInputProps()

    const { config } = usePrepareContractWrite({
        ...crowdFundingContract,
        functionName: 'contribute',
        overrides: {
            value: ethers.utils.parseEther(value),
        },
    })
    const { data: txData, write } = useContractWrite(config)

    return (
        <>
            <HStack m="5">
                <Button {...dec}>-</Button>
                <Input {...input} />
                <Button {...inc}>+</Button>
            </HStack>
            <Box>
                <Button
                    disabled={!write}
                    onClick={() => write?.()}
                    colorScheme="blue"
                >
                    Contribute
                </Button>
            </Box>
        </>
    )
}
export default Contribute
