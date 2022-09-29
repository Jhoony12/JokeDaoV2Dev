import shallow from 'zustand/shallow'
import Head from 'next/head'
import { chains } from '@config/wagmi'
import { getLayout } from '@layouts/LayoutViewContest'
import type { NextPage } from 'next'
import { useStore } from '@hooks/useContest/store'
import ButtonDownloadContestDataAsCSV from '@components/_pages/ButtonDownloadContestDataAsCSV'
import { supabase } from '@config/supabase'

interface PageProps {
  address: string,
  contestData: any,
}
//@ts-ignore
const Page: NextPage = (props: PageProps) => {
  const { address, contestData } = props
  const { isSuccess, isLoading, contestName } = useStore(state =>  ({ 
    //@ts-ignore
    isLoading: state.isLoading,
    //@ts-ignore
    contestName: state.contestName, 
    //@ts-ignore
    isSuccess: state.isSuccess,
   }), shallow);
  return (
    <>
      <Head>
        <title>Export contest data  - JokeDAO</title>
        <meta name="description" content={`Export to CSV the data of ${contestData?.title ? contestData.title : contestName ? contestName : "this contest"} on JokeDAO.`} />
      </Head>
    <h1 className='sr-only'>Export data of contest {contestName ? contestName : address} </h1>
    {!isLoading  && isSuccess && <div className='animate-appear mt-4'>
        <p>Let&apos;s create a spreadsheet of full data from your contest: <br/>
            proposals, addresses of submitters, voters, number of votes, etc.
        </p>
        <p className="mt-3 mb-6">
            You can use this to allocate rewards, track contributions, or find correlations among voters.
        </p>
        <ButtonDownloadContestDataAsCSV />
    </div>}
  </>
)}

const REGEX_ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]{40}$/

export async function getStaticPaths() {
  try {
    const { data } = await supabase
    .from("contests")
    .select("address, network_name")
    const paths = data?.map(contest => {
      return { params: { 
        address: contest?.address,
        chain: contest?.network_name,
      } }
    })
    return {
      paths: paths ?? [],
      fallback: "blocking",
    }
  } catch(e) {
    console.error(e)
    return {paths: [], fallback: "blocking" }
  }
}

export async function getStaticProps({ params }: any) {
  const { chain, address } = params
  if (!REGEX_ETHEREUM_ADDRESS.test(address) || chains.filter(c => c.name.toLowerCase().replace(' ', '') === chain).length === 0 ) {
    return { notFound: true }
  }

  try {
    const { data } = await supabase
    .from("contests")
    .select("title")
    .eq("address", address)
    .eq("network_name", chain);

    return {
      props: {
        address,
        contestData: data?.[0],
      },
      revalidate: 10,
    }
  } catch (error) {
    console.error(error)
    return { notFound: true }
  }
}
//@ts-ignore
Page.getLayout = getLayout

export default Page
