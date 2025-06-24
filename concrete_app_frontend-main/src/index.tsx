import ReactDOM from 'react-dom/client'
import App from './App'
import './index.scss'
import store from './store/store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
)
