import React from "react";
import Immutable from "immutable";
import DashboardList from "./DashboardList";
import { RecentTransactions } from "../Account/RecentTransactions";
import Translate from "react-translate-component";
import MarketCard from "./MarketCard";
import utils from "common/utils";
import { Apis } from "bitsharesjs-ws";
var logo = require("assets/logo-ico-blue.png");
import LoadingIndicator from "../LoadingIndicator";
import SettingsActions from "actions/SettingsActions";
import WalletUnlockActions from "actions/WalletUnlockActions";

class Dashboard extends React.Component {

    constructor() {
        super();
        let marketsByChain = {
            "4018d784":[
                ["CNY", "OPEN.BTC"],
                ["CNY", "USD"],
                ["CNY", "OPEN.ETH"],
                ["CNY", "BTS"],
                ["BTS", "CNY"],
                ["BTS", "USD"],
                ["BTS", "GOLD"],
                ["BTS", "OPEN.BTC"]
              
            ],
            "39f5e2ed": [
                ["TEST", "PEG.FAKEUSD"],
                ["TEST", "BTWTY"]
            ]
        };
        let chainID = Apis.instance().chain_id;
        if (chainID) chainID = chainID.substr(0, 8);

        this.state = {
            width: null,
            showIgnored: false,
            featuredMarkets: marketsByChain[chainID] || marketsByChain["4018d784"],
            newAssets: [

            ]
        };

        this._setDimensions = this._setDimensions.bind(this);
        // this._sortMarketsByVolume = this._sortMarketsByVolume.bind(this);
    }

    componentDidMount() {
        this._setDimensions();

        window.addEventListener("resize", this._setDimensions, {capture: false, passive: true});
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextState.featuredMarkets, this.state.featuredMarkets) ||
            !utils.are_equal_shallow(nextProps.lowVolumeMarkets, this.props.lowVolumeMarkets) ||
            !utils.are_equal_shallow(nextState.newAssets, this.state.newAssets) ||
            nextProps.linkedAccounts !== this.props.linkedAccounts ||
            // nextProps.marketStats !== this.props.marketStats ||
            nextProps.ignoredAccounts !== this.props.ignoredAccounts ||
            nextProps.passwordAccount !== this.props.passwordAccount ||
            nextState.width !== this.state.width ||
            nextProps.accountsReady !== this.props.accountsReady ||
            nextState.showIgnored !== this.state.showIgnored
        );
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._setDimensions);
    }

    _setDimensions() {
        let width = window.innerWidth;

        if (width !== this.state.width) {
            this.setState({width});
        }
    }

    _onToggleIgnored() {
        this.setState({
            showIgnored: !this.state.showIgnored
        });
    }

    // _sortMarketsByVolume(a, b) {
    //     let idA = a[1] + "_" + a[0];
    //     let idB = b[1] + "_" + b[0];
    //     let statsA = this.props.marketStats.get(idA);
    //     let statsB = this.props.marketStats.get(idB);
    //     if (!statsA || !statsB) return -1;
    //
    //     function getEquivalentVolume(stats, market, marketStats) {
    //         let coreVolume = stats.volumeBaseAsset.asset_id === "1.3.0" ? stats.volumeBaseAsset :
    //            stats.volumeQuoteAsset.asset_id === "1.3.0" ? stats.volumeQuoteAsset : 0;
    //
    //         if (!coreVolume) {
    //             let options = [
    //                 `${market[1]}_BTS`,
    //                 `BTS_${market[1]}`,
    //                 `${market[0]}_BTS`,
    //                 `BTS_${market[0]}`,
    //             ];
    //             let convertUsingStats;
    //             for (var i = 0; i < options.length; i++) {
    //                 convertUsingStats = marketStats.get(options[i]);
    //                 if (convertUsingStats) break;
    //             }
    //
    //             if (convertUsingStats && convertUsingStats.price) {
    //                 if (convertUsingStats.price.base.asset_id === "1.3.0") {
    //                     if (stats.volumeBaseAsset.asset_id === convertUsingStats.price.quote.asset_id) {
    //                         coreVolume = stats.volumeBaseAsset.times(convertUsingStats.price);
    //                     } else if (stats.volumeQuoteAsset.asset_id === convertUsingStats.price.quote.asset_id) {
    //                         coreVolume = stats.volumeQuoteAsset.times(convertUsingStats.price);
    //                     }
    //                 } else if (convertUsingStats.price.quote.asset_id === "1.3.0") {
    //                     if (stats.volumeBaseAsset.asset_id === convertUsingStats.price.base.asset_id) {
    //                         coreVolume = stats.volumeBaseAsset.times(convertUsingStats.price);
    //                     } else if (stats.volumeQuoteAsset.asset_id === convertUsingStats.price.base.asset_id) {
    //                         coreVolume = stats.volumeQuoteAsset.times(convertUsingStats.price);
    //                     }
    //                 }
    //
    //                 console.log(market, "coreVolume", coreVolume && coreVolume.getAmount(), coreVolume && coreVolume.asset_id);
    //
    //             } else {
    //                 console.log(market, "*** Unable to convert price ***");
    //             }
    //         }
    //
    //         return coreVolume;
    //     }
    //
    //     let coreVolumeA = getEquivalentVolume(statsA, a, this.props.marketStats);
    //     let coreVolumeB =  getEquivalentVolume(statsB, b, this.props.marketStats);
    //
    //     if (coreVolumeA && coreVolumeB) {
    //         return coreVolumeB.getAmount() - coreVolumeA.getAmount();
    //     }
    //     return 0;
    // }

    render() {
        let { linkedAccounts, myIgnoredAccounts, accountsReady, passwordAccount } = this.props;
        let {width, showIgnored, featuredMarkets, newAssets} = this.state;

        if (passwordAccount && !linkedAccounts.has(passwordAccount)) {
            linkedAccounts = linkedAccounts.add(passwordAccount);
        }
        let names = linkedAccounts.toArray().sort();
        if (passwordAccount && names.indexOf(passwordAccount) === -1) names.push(passwordAccount);
        let ignored = myIgnoredAccounts.toArray().sort();

        let accountCount = linkedAccounts.size + myIgnoredAccounts.size + (passwordAccount ? 1 : 0);

        if (!accountsReady) {
            return <LoadingIndicator />;
        }

        let validMarkets = 0;
        
        let marketsList = {
            "ico":[
                
                
                ["QCNY", "VEN"],
                ["CNY", "VEN"],
                ["CNY", "QCNY"],
                ["CNY", "VEN.WARRANT"],
                ["QCNY", "BCDN.WARRANT"],
                ["QCNY", "BCDN"],
                ["CNY", "BCDN"],
            ],
            "special": [
                
                ["BTS", "BTWTY"],
                ["BTS", "HERO"],
                ["BTS", "GOLD"],
                ["BTS", "EUR"]
            ]
        };
        
        let ico_markets = marketsList["ico"]
        // .sort(this._sortMarketsByVolume)
        .map(pair => {
            let isLowVolume = this.props.lowVolumeMarkets.get(pair[1] + "_" + pair[0]) || this.props.lowVolumeMarkets.get(pair[0] + "_" + pair[1]);
            if (!isLowVolume) validMarkets++;
            // validMarkets++;
            let className = "";
            if (validMarkets > 9) {
                className += ` show-for-${!accountCount ? "xlarge" : "large"}`;
            } else if (validMarkets > 6) {
                className += ` show-for-${!accountCount ? "large" : "medium"}`;
            }

            return (
                <MarketCard
                    key={pair[0] + "_" + pair[1]}
                    marketId={pair[1] + "_" + pair[0]}
                    new={newAssets.indexOf(pair[1]) !== -1}
                    className={className}
                    quote={pair[0]}
                    base={pair[1]}
                    invert={pair[2]}
                    isLowVolume={isLowVolume}
                    hide={validMarkets > 16}
                />
            );
        }).filter(a => !!a);
        
        let special_markets = marketsList["special"]
        // .sort(this._sortMarketsByVolume)
        .map(pair => {
            let isLowVolume = this.props.lowVolumeMarkets.get(pair[1] + "_" + pair[0]) || this.props.lowVolumeMarkets.get(pair[0] + "_" + pair[1]);
            if (!isLowVolume) validMarkets++;
            let className = "";
            if (validMarkets > 9) {
                className += ` show-for-${!accountCount ? "xlarge" : "large"}`;
            } else if (validMarkets > 6) {
                className += ` show-for-${!accountCount ? "large" : "medium"}`;
            }

            return (
                <MarketCard
                    key={pair[0] + "_" + pair[1]}
                    marketId={pair[1] + "_" + pair[0]}
                    new={newAssets.indexOf(pair[1]) !== -1}
                    className={className}
                    quote={pair[0]}
                    base={pair[1]}
                    invert={pair[2]}
                    isLowVolume={isLowVolume}
                    hide={validMarkets > 16}
                />
            );
        }).filter(a => !!a);
        

        let markets = featuredMarkets
        // .sort(this._sortMarketsByVolume)
        .map(pair => {
            let isLowVolume = this.props.lowVolumeMarkets.get(pair[1] + "_" + pair[0]) || this.props.lowVolumeMarkets.get(pair[0] + "_" + pair[1]);
            if (!isLowVolume) validMarkets++;
            let className = "";
            if (validMarkets > 9) {
                className += ` show-for-${!accountCount ? "xlarge" : "large"}`;
            } else if (validMarkets > 6) {
                className += ` show-for-${!accountCount ? "large" : "medium"}`;
            }

            return (
                <MarketCard
                    key={pair[0] + "_" + pair[1]}
                    marketId={pair[1] + "_" + pair[0]}
                    new={newAssets.indexOf(pair[1]) !== -1}
                    className={className}
                    quote={pair[0]}
                    base={pair[1]}
                    invert={pair[2]}
                    isLowVolume={isLowVolume}
                    hide={validMarkets > 16}
                />
            );
        }).filter(a => !!a);

        if (!accountCount) {
            return (
                <div ref="wrapper" className="grid-block page-layout vertical">
                    <div ref="container" className="grid-block vertical medium-horizontal"  style={{padding: "25px 10px 0 10px"}}>
                        <div className="grid-block vertical small-12 medium-5">
                            <div className="Dashboard__intro-text">
                                <h4><img style={{position: "relative", top: -15, margin: 0}} src={logo}/><Translate content="account.intro_text_title" /></h4>

                                <Translate unsafe content="account.intro_text_1" component="p" />
                                <Translate unsafe content="account.intro_text_2" component="p" />
                                <Translate unsafe content="account.intro_text_3" component="p" />
                                <Translate unsafe content="account.intro_text_4" component="p" />
                                <div className="button-group">
                                    <div className="button create-account" onClick={() => {this.props.router.push("create-account");}}>
                                        <Translate content="account.create_new" />
                                    </div>

                                    
                                </div>
                            </div>
                        </div>
                        <div className="grid-container small-12 medium-7" style={{paddingTop: 44}}>
                            
                            <Translate content="exchange.ico" component="h4" style={{paddingLeft: 30}}/>
                            <div className="grid-block small-up-1 large-up-3 xlarge-up-4 no-overflow fm-outer-container">
                                {markets}
                            </div>
                            
                        </div>
                        
                        <div className="grid-container small-12 medium-7" style={{paddingTop: 44}}>
                            
                            <Translate content="exchange.ico" component="h4" style={{paddingLeft: 30}}/>
                            <div className="grid-block small-up-1 large-up-3 xlarge-up-4 no-overflow fm-outer-container">
                                {ico_markets}
                            </div>
                            
                        </div>
                        
                    </div>
                </div>
            );
        }

        return (
            <div ref="wrapper" className="grid-block page-layout vertical">
                <div ref="container" className="grid-container" style={{padding: "25px 10px 0 10px"}}>
                    
                    
                    <div className="block-content-header" style={{marginBottom: 15}}>
                    <Translate content="exchange.ico"/>
                    </div>
                    <div className="grid-block small-up-1 medium-up-3 large-up-4 no-overflow fm-outer-container">
                        {ico_markets}
                    </div>
                    
                    

                    

                    

                </div>
            </div>
        );
    }
}

export default Dashboard;
