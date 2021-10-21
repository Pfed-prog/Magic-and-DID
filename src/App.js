import './App.css';
import { useEffect, useState} from 'react';
import CeramicClient from '@ceramicnetwork/http-client';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect'
import { DID } from 'dids'
import DataModels from './DataModels';

const API_URL = 'https://ceramic-clay.3boxlabs.com';

function App() {
    
    const [ceramic, setCeramic] = useState();
    const [ethAddresses, setEthAddresses] = useState();
    const [ethereum, setEthereum] = useState();
    const [appStarted, setAppStarted] = useState(false);
  
    useEffect(() => {
      if(window.ethereum) {
        setEthereum(window.ethereum);
        (async() => {
          try {
            const addresses = await window.ethereum.request({ method: 'eth_requestAccounts'})
            setEthAddresses(addresses);
          }
          catch(e) { 
            console.log(e);
          }
        })();
      }
    }, []);
  
    useEffect(() => {
      if(ethereum && ethAddresses) {
        (async () => {
          const newCeramic = new CeramicClient(API_URL);
  
          const resolver = {
            ...ThreeIdResolver.getResolver(newCeramic),
          }
          const did = new DID({ resolver })
          newCeramic.did = did;
          const threeIdConnect = new ThreeIdConnect()
          const authProvider = new EthereumAuthProvider(ethereum, ethAddresses[0]);
          await threeIdConnect.connect(authProvider)
  
          const provider = await threeIdConnect.getDidProvider();
          newCeramic.did.setProvider(provider);
          await newCeramic.did.authenticate();
  
          setCeramic(newCeramic);
        })();
      }
    }, [ethereum, ethAddresses]);
  
    function getEthNeededPanel() {
      return <div>
        You need wallet
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">
          Try MetaMask
        </a>
      </div>;
    }
  
    function getWaitingForEthPanel() {
      return <div>
        Waiting for Ethereum accounts...
      </div>;
    }
  
    function getWaitingForDIDPanel() {
      return <div>
        Waiting for a decentralized ID...
      </div>
    }
  
    function getLandingPage() {
      return (
        <div>
              <h1>
                We got your app 
              </h1>

                { 
                  ethereum ? 
                  (
                    ethAddresses ?  
                    (
                      ceramic ?
                      <button onClick={() => setAppStarted(true)}>Let&apos;s go !!</button> : 
                      getWaitingForDIDPanel()
                    ) 
                    :
                    getWaitingForEthPanel() 
                  )
                  :
                  getEthNeededPanel()
                }
              </div>
      );
    }

    function getSkillsPage() {
      return <DataModels ceramic={ceramic} setAppStarted={setAppStarted} />
    }
  
    return (
      <div>
        {
          (ceramic && appStarted) ?
            getSkillsPage() :
            getLandingPage()
        }
      </div>
   
    );
  }

export default App;