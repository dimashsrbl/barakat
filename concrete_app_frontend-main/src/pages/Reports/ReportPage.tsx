import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const ReportPage = () => {

    const url = useLocation();
    const navigate = useNavigate();
    const isMobile: boolean = useWindowSize();

    return (
        <div className='main'>
        {isMobile && 
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {isMobile ? (
            <>
            <div className='df fdr jcsb aic' style={{marginTop: '4em'}}>
                <span className="fz18">Отчеты</span>
            </div>
            </>
        ) : (
            <div className="df fdr jcsb aib">
                <span className="fz28">Отчеты</span>
                <WeightIndicatorComponent/>
            </div>
        )}
        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.topBlock} df fdr aic jcsb`}>
                <div className={`${s.buttonsBlock} df aic fz16`}>
                    <button
                        className={s.barButton}
                        disabled={false}
                        onClick={() => { navigate('/main/reports') }}
                        style={{
                            borderBottom: url.pathname === '/main/reports' ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname === '/main/reports' ? '#2F80ED' : '',
                        }}>
                        Отчеты по отвесам
                    </button>
                    <button
                        className={s.barButton}
                        disabled={false}
                        style={{
                            borderBottom: url.pathname.includes('application-reports') ? '2px solid #2F80ED' : '2px solid #E0E0E0',
                            color: url.pathname.includes('application-reports')? '#2F80ED' : '',
                        }}
                        onClick={() => { navigate('/main/reports/application-reports') }}
                    >
                        Отчеты по заявкам
                    </button>
                </div>
            </div>
            <Outlet />
        </div>
    </div>
    )
}