import Button from "@components/UI/Button";
import { IconTrophy } from "@components/UI/Icons";
import { ofacAddresses } from "@config/ofac-addresses/ofac-addresses";
import {
  ROUTE_CONTEST_PROPOSAL,
  ROUTE_VIEW_CONTEST,
  ROUTE_VIEW_CONTEST_REWARDS,
  ROUTE_VIEW_CONTEST_RULES,
} from "@config/routes";
import { CONTEST_STATUS } from "@helpers/contestStatus";
import { CalendarIcon, ClipboardListIcon, PaperAirplaneIcon } from "@heroicons/react/outline";
import { HomeIcon } from "@heroicons/react/solid";
import { useContestStore } from "@hooks/useContest/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useSubmitProposalStore } from "@hooks/useSubmitProposal/store";
import { useUserStore } from "@hooks/useUser/store";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { CustomError } from "types/error";
import { useAccount, useNetwork } from "wagmi";
import Timeline from "../Timeline";
import VotingToken from "../VotingToken";
import styles from "./styles.module.css";

interface SidebarProps {
  isLoading: boolean;
  isListProposalsLoading: boolean;
  isSuccess: boolean;
  isError: CustomError | null;
  isListProposalsError: CustomError | null;
  chainId: number;
  setIsTimelineModalOpen: (isOpen: boolean) => void;
}

export const Sidebar: FC<SidebarProps> = ({
  isLoading,
  isListProposalsLoading,
  isSuccess,
  isError,
  isListProposalsError,
  chainId,
  setIsTimelineModalOpen,
}) => {
  const { query, pathname } = useRouter();
  const { chain } = useNetwork();
  const account = useAccount({
    onConnect({ address }) {
      if (address != undefined && ofacAddresses.includes(address?.toString())) {
        location.href = "https://www.google.com/search?q=what+are+ofac+sanctions";
      }
    },
  });

  const {
    amountOfTokensRequiredToSubmitEntry,
    currentUserProposalCount,
    contestMaxNumberSubmissionsPerUser,
    currentUserSubmitProposalTokensAmount,
  } = useUserStore(state => state);
  const { listProposalsIds } = useProposalStore(state => state);
  const { contestMaxProposalCount, submissionsOpen, votesOpen, votesClose, contestStatus, supportsRewardsModule } =
    useContestStore(state => state);

  const { setIsSubmitProposalModalOpen } = useSubmitProposalStore(state => ({
    setIsSubmitProposalModalOpen: state.setIsModalOpen,
  }));

  return (
    <>
      <nav className={`${styles.navbar} md:shrink-0 md:grow-0 md:space-y-1 `}>
        <Link
          className={`${styles.navLink} ${
            [ROUTE_VIEW_CONTEST, ROUTE_CONTEST_PROPOSAL].includes(pathname) ? styles["navLink--active"] : ""
          }`}
          href={{
            pathname: ROUTE_VIEW_CONTEST,
            query: {
              chain: query.chain,
              address: query.address,
            },
          }}
        >
          <HomeIcon className={styles.navLinkIcon} /> Contest
        </Link>
        <Link
          className={`${styles.navLink} ${pathname === ROUTE_VIEW_CONTEST_RULES ? styles["navLink--active"] : ""}`}
          href={{
            pathname: ROUTE_VIEW_CONTEST_RULES,
            query: {
              chain: query.chain,
              address: query.address,
            },
          }}
        >
          <ClipboardListIcon className={styles.navLinkIcon} />
          Rules
        </Link>
        {supportsRewardsModule && (
          <Link
            className={`${styles.navLink} ${pathname === ROUTE_VIEW_CONTEST_REWARDS ? styles["navLink--active"] : ""}`}
            href={{
              pathname: ROUTE_VIEW_CONTEST_REWARDS,
              query: {
                chain: query.chain,
                address: query.address,
              },
            }}
          >
            <IconTrophy className={styles.navLinkIcon} />
            Rewards
          </Link>
        )}
      </nav>
      {!isLoading && contestStatus === CONTEST_STATUS.SUBMISSIONS_OPEN && (
        <>
          <Button
            onClick={() => setIsSubmitProposalModalOpen(true)}
            className="animate-appear fixed md:static z-10  md:mt-3 aspect-square 2xs:aspect-auto bottom-16 inline-end-5 md:bottom-unset md:inline-end-unset disabled:!opacity-100 disabled:!border-opacity-50 disabled:!text-opacity-50"
            intent={
              currentUserSubmitProposalTokensAmount < amountOfTokensRequiredToSubmitEntry ||
              currentUserProposalCount >= contestMaxNumberSubmissionsPerUser ||
              listProposalsIds.length >= contestMaxProposalCount ||
              contestStatus !== CONTEST_STATUS.SUBMISSIONS_OPEN ||
              isLoading ||
              isListProposalsLoading ||
              isListProposalsError !== null ||
              isError !== null ||
              chain?.id !== chainId
                ? "primary-outline"
                : "primary"
            }
            disabled={
              currentUserSubmitProposalTokensAmount < amountOfTokensRequiredToSubmitEntry ||
              currentUserProposalCount >= contestMaxNumberSubmissionsPerUser ||
              listProposalsIds.length >= contestMaxProposalCount ||
              contestStatus !== CONTEST_STATUS.SUBMISSIONS_OPEN ||
              isLoading ||
              isListProposalsLoading ||
              isListProposalsError !== null ||
              isError !== null ||
              chain?.id !== chainId
            }
          >
            <PaperAirplaneIcon className="w-5 2xs:w-6 rotate-45 2xs:mie-0.5 -translate-y-0.5 md:hidden" />
            <span className="sr-only 2xs:not-sr-only">Submit</span>
          </Button>
        </>
      )}
      <Button
        onClick={() => setIsTimelineModalOpen(true)}
        disabled={isLoading || isError !== null || !submissionsOpen || !votesOpen || !votesClose}
        intent="true-solid-outline"
        className={`
  ${contestStatus === CONTEST_STATUS.SUBMISSIONS_OPEN ? "bottom-32" : "bottom-16"}
  animate-appear fixed md:static md:hidden z-10 aspect-square 2xs:aspect-auto inline-end-5 md:bottom-unset md:inline-end-unset`}
      >
        <CalendarIcon className="w-5 2xs:mie-1 md:hidden" />
        <span className="sr-only 2xs:not-sr-only">Timeline</span>
      </Button>
      {!isLoading && isSuccess && submissionsOpen && votesOpen && votesClose && (
        <>
          {account?.address && (
            <div className="hidden md:my-4 md:block">
              <VotingToken />
            </div>
          )}
          <div className={`hidden md:block ${!account?.address ? "md:mt-4" : ""}`}>
            <Timeline />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
