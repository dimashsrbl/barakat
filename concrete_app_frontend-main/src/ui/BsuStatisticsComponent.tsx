import { CaretDown } from 'assets/icons/CaretDown';
import { CaretUp } from 'assets/icons/CaretUp';
import { parseTimeWithoutSecond } from 'constDatas';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getConcreteMixingPlantStatisticsData } from 'store/features/apiSlice';

interface props {
  width?: string
  height?: string
}

export const BsuStatisticsComponent = ({width, height}: props) => {
  const [data, setData] = useState<any>([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const colors = ['#219653', '#F2994A', '#EB5757'];

  const dispatch = useDispatch();
  
  const getConcreteMixingPlantStatistics = useCallback(async () => {
    const response = await dispatch(getConcreteMixingPlantStatisticsData());
    const responseData = response?.payload?.data || []
    setData(responseData);
  }, [dispatch]);

  const handleSelectRow = (index: any) => {
    if (selectedRow === index) {
        setSelectedRow(null);
    } else {
        setSelectedRow(index);
    }
}

  useEffect(() => {
    getConcreteMixingPlantStatistics();
  }, [getConcreteMixingPlantStatistics])

    return (
      <div className="bsuStatisticsBlock df" style={{gap: '11px', width}}>
        {data && data.map((item:any, index:any) => (
          <div className={`bsuStatisticsItem df aic jcsb fww ${selectedRow === index ? 'show' : ''}`} key={index} style={{height}}>
              <span className='fz16 cg-2'>БСУ {item?.concrete_mixing_plant?.name}</span>
              <span className="fz16" style={{color: colors[index % 3]}}>{item?.total || 0}/5 АБС</span>
              <div className='cp df aic' onClick={() => {handleSelectRow(index)}}>
                {selectedRow === index ? <CaretUp /> : <CaretDown />}
              </div>

            {selectedRow === index && 
              <div className={`bsuItemDropdown w100 df fdc`}>
                {item?.statistics && item?.statistics.map((statistic:any, innerIndex: any) => (
                  <div className="df fdc" style={{gap: '4px'}} key={innerIndex}>
                    <span className='fz14 cg-2 fw600'>{statistic?.object_name || '-'}</span>
                  <div className="df fdr jcsb">
                    <span className='fz12 cg'>{statistic?.plate_number || '-'}</span>
                    <span className='fz12 cg'>{statistic?.cubature || '-'}</span>
                    <span className='fz12 cg'>{parseTimeWithoutSecond(statistic?.first_at) || '-'}</span>
                  </div>
                  <div style={{height: '1px', borderTop: '1px solid #F2F2F2', gap: '10px', marginTop: '10px'}}/>
                  </div>
                ))}
              </div>
            }
          </div>
        ))}
      </div>
    )
}