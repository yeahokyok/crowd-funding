import { ConnectKitButton } from 'connectkit'

import Funding from './components/Funding.component'

import './App.css'

function App() {
    return (
        <div className="App">
            <Funding />
            <ConnectKitButton showBalance={false} showAvatar="true" />
        </div>
    )
}

export default App
