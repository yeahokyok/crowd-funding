import { ConnectKitButton } from 'connectkit'

import Funding from './components/Funding.component'

import './App.css'

function App() {
    return (
        <div className="App">
            <ConnectKitButton showBalance={false} showAvatar="true" />
            {/* <Funding /> */}
        </div>
    )
}

export default App
