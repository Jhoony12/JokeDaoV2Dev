import DialogModal from "@components/UI/DialogModal";

interface DialogWithdrawFundsFromRewardsModuleProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  children: React.ReactNode;
}

export const DialogWithdrawFundsFromRewardsModule = (props: DialogWithdrawFundsFromRewardsModuleProps) => {
  const { children, ...dialogProps } = props;

  return (
    <DialogModal title="Withdraw rewards from module" {...dialogProps}>
      <p className="font-bold mb-4 animate-appear">Withdraw funds from the rewards module</p>
      {children}
    </DialogModal>
  );
};

export default DialogWithdrawFundsFromRewardsModule;
