import * as React from "react";

import BigNumber from "bignumber.js";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { getLogo } from "../lib/logos";
import { IPartialWithdrawRequest, Token } from "../lib/swapperd";

interface IBalanceItemProps {
    token: Token;
    amount: BigNumber;
    address: string;
    setWithdrawRequest: (withdrawRequest: IPartialWithdrawRequest) => void;
}

interface IBalanceItemState {
    copied: string;
}

export class BalanceItem extends React.Component<IBalanceItemProps, IBalanceItemState> {
    constructor(props: IBalanceItemProps) {
        super(props);
        this.state = {
            copied: "",
        };
        this.handleWithdraw = this.handleWithdraw.bind(this);
    }

    public render() {
        const { token, amount, address } = this.props;
        const { copied } = this.state;
        return (
            <div className="balances--item" onClick={this.handleWithdraw}>
                <div className="balances--token">
                    <img src={getLogo(token)} />
                    <p>{token}</p>
                </div>
                <div className="balances--amount">
                    {/* Show at least 2 decimal places and at most 10 decimal places */}
                    <p>{amount.toFixed(Math.min(10, Math.max(2, (amount.toFixed().split(".")[1] || []).length)))}</p>
                </div>
                <div className="balances--address" onClick={this.consumeClick}>
                    <CopyToClipboard text={address} onCopy={this.handleCopy.bind(this, address)}>
                        {address === "" ?
                            <p className="address" />
                            : copied === address ?
                                <p>Copied!</p> :
                                <p className="address">{`${address.substring(0, 8)}...${address.slice(-8)}`}</p>
                        }
                    </CopyToClipboard>
                </div>
                <div className="balances--transfer" onClick={this.handleWithdraw} />
            </div >
        );
    }

    private handleCopy(address: string): void {
        this.setState({ copied: address });
        setTimeout(() => {
            this.setState({ copied: "" });
        }, 1000);
    }

    private consumeClick(e: React.MouseEvent<HTMLDivElement>): void {
        e.stopPropagation();
    }

    private handleWithdraw(): void {
        this.props.setWithdrawRequest({ token: this.props.token });
    }
}