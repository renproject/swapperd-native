import * as React from "react";

import { NETWORKS, Network } from "../lib/swapperd";

import logo from "../styles/images/logo.png";

interface IHeaderProps {
    network: Network;
    hideNetwork?: boolean;
    setNetwork: (network: string) => void;
}

export class Header extends React.Component<IHeaderProps, {}> {
    constructor(props: IHeaderProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    public render(): JSX.Element {
        const { hideNetwork } = this.props;
        return (
            <div className="header">
                <img src={logo} alt="Swapperd" />
                {!hideNetwork &&
                    <select value={this.props.network} onChange={this.handleChange}>
                        {
                            Object.keys(NETWORKS).map(key => <option key={key} value={key}>{NETWORKS[key]}</option>)
                        }
                    </select>
                }
            </div>
        );
    }

    private handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const network = event.target.value;
        this.props.setNetwork(network);
    }
}
