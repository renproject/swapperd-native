import * as React from "react";

import { Container, Subscribe } from "unstated";

import { initialState } from "@/store/initialState";
import { ApplicationData } from "@/store/storeTypes";
import { Network } from "common/types";

export class AppContainer extends Container<ApplicationData> {
    public state = initialState;

    // App data
    public setUpdateReady = async (version: string) =>
        this.setState({ app: { ...this.state.app, updateReady: version } })
    public clearUpdateReady = async () =>
        this.setState({ app: { ...this.state.app, updateReady: null } })

    // Login data
    public setPassword = async (password: string) =>
        this.setState({ login: { ...this.state.login, password } })
    public clearPassword = async () =>
        this.setState({ login: { ...this.state.login, password: null } })

    // Trader data
    public setNetwork = async (network: Network) =>
        this.setState({ trader: { ...this.state.trader, network } })

}

export interface ConnectedProps {
    container: AppContainer;
}

// Typesafe version of https://github.com/goncy/unstated-connect
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export function connect<X extends ConnectedProps>(_container: typeof AppContainer) {
    return (Component: React.ComponentClass<X>) => (props: Omit<X, "container">) => (
        // tslint:disable: no-any
        <Subscribe to={[_container]}>
            {(...container) => <Component {...({ ...props, container: container } as any as X)} />}
        </Subscribe>
        // tslint:enable: no-any
    );
}