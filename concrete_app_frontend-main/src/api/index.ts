import axios from 'axios'

const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";
console.log('API Base URL:', baseURL);
console.log('Environment variable:', process.env.REACT_APP_BASE_URL);
//const baseURL = "http://localhost:8000";
//const baseURL = process.env.REACT_APP_BASE_URL || `${protocol}//api.${host}/`;

const api = axios.create({
  baseURL: baseURL,
})

const { CancelToken } = axios
let cancel: Function | null

// Интерцептор для запросов
axios.interceptors.request.use(
  (config: any) => {
    config.cancelToken = new CancelToken((c) => {
      cancel = c
    })

    // Всегда используем supplier_token, если он есть, иначе authtoken
    const supplierToken = localStorage.getItem('supplier_token');
    const token = supplierToken || localStorage.getItem('authtoken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для ответов
axios.interceptors.response.use(
  (response) => {
    cancel = null
    return response
  },
  (error) => {
    cancel = null
    return Promise.reject(error)
  }
)

export const cancelPendingRequests = () => {
  if (cancel) {
    cancel('Запрос отменен из-за размонтирования компонента')
  }
}

// USERS
export const getUsers: any = (token: string, is_active?: boolean, limit?: number, offset?: number) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
  };
  
  return api.get('/api/users', {params: queryParams, headers })
}

export const postUser: any = (obj: any) => {
  return api.post('/api/auth/login', obj)
}

export const getCurrentUser: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get('/api/users/me', { headers })
}

export const getUserById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { user_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/users/${user_id}`, { headers })
}

export const postAdduser: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/users/create', obj, { headers })
}

export const putEdituser: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { user_id } = obj

  return api.put(`/api/users/${user_id}`, obj, { headers })
}

export const patchIsActiveUserChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { user_id } = obj

  return api.patch(`/api/users/is_active/${user_id}`, obj, { headers })
}

// COMPANIES
export const getCompanies: any = (token: string, is_active?: boolean, limit?: number, offset?: number, company_function?: string, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(company_function && { company_function }),
    ...(name && { name }),
  };

  return api.get('/api/company/get', { params: queryParams, headers });
}


export const getCompanyById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { company_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/company/get/${company_id}`, { headers })
}

export const putEditcompanies: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { company_id } = obj

  return api.put(`/api/company/update/${company_id}`, obj, { headers })
}

export const putEditCompanyIsDebtor: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { company_id } = obj

  return api.put(`/api/company/is_debtor/${company_id}`, obj, { headers })
}

export const postAddcompanies: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/company/create', obj, { headers })
}

export const patchIsActiveCompanyChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/company/is_active/${id}`, obj, { headers })
}

// ОБЪЕКТЫ
export const getObjects: any = (token: string, is_active?: boolean, limit?: number, offset?: number, is_for_independent?: boolean, company_id?: number, is_for_requests?: boolean, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_for_independent && { is_for_independent }),
    ...(company_id && { company_id }),
    ...(is_for_requests && { is_for_requests }),
    ...(name && { name }),
  };

  return api.get('/api/object/get', {params: queryParams, headers })
}

export const getObjectsById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { object_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/object/get/${object_id}`, { headers })
}

export const getOffObjects: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
  }
  return api.get('/object/deactivated', { headers })
}

export const postAddObjects: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.post('/api/object/create', obj, { headers })
}

export const putEditObjects: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { object_id } = obj

  return api.put(`/api/object/update/${object_id}`, obj, { headers })
}

export const patchIsActiveObjectsChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/object/is_active/${id}`, obj, { headers })
}

// МАТЕРИАЛЫ
export const getMaterials: any = (token: string, is_active?: boolean, limit?: number, offset?: number, is_for_independent?: boolean, is_for_dependent?: boolean, object_id?: number, is_for_requests?: boolean, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_for_independent && { is_for_independent }),
    ...(is_for_dependent && { is_for_dependent }),
    ...(object_id && { object_id }),
    ...(is_for_requests && { is_for_requests }),
    ...(name && { name }),
  };

  return api.get('/api/material/get', {params: queryParams, headers })
}

export const getMaterialById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { material_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/material/get/${material_id}`, { headers })
}

export const getOffMaterials: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
  }
  return api.get('/materials/deactivated', { headers })
}

export const postAddmaterials: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.post('/api/material/create', obj, { headers })
}

export const putEditmaterials: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { material_id } = obj

  return api.put(`/api/material/update/${material_id}`, obj, { headers })
}

export const patchIsActiveMaterialChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/material/is_active/${id}`, obj, { headers })
}

// CONSTRUCTIONS
export const getConstructions: any = (token: string, is_active?: boolean, limit?: number, offset?: number, is_for_independent?: boolean, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_for_independent && { is_for_independent }),
    ...(name && { name }),
  };

  return api.get('/api/construction/get', {params: queryParams, headers })
}

export const getConstructionsById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { construction_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/construction/get/${construction_id}`, { headers })
}

export const getOffConstructions: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
  }
  return api.get('/construction/deactivated', { headers })
}

export const postAddConstructions: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.post('/api/construction/create', obj, { headers })
}

export const putEditConstructions: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { construction_id } = obj

  return api.put(`/api/construction/update/${construction_id}`, obj, { headers })
}

export const patchIsActiveConstructionsChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/construction/is_active/${id}`, obj, { headers })
}

// ACCEPTANCE-METHOD
export const getAcceptanceMethod: any = (token: string, is_active?: boolean, limit?: number, offset?: number, is_for_independent?: boolean, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_for_independent && { is_for_independent }),
    ...(name && { name }),
  };

  return api.get('/api/receive_method/get', {params: queryParams, headers })
}

export const getAcceptanceMethodById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { receive_method_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/receive_method/get/${receive_method_id}`, { headers })
}

export const getOffAcceptanceMethod: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
  }
  return api.get('/receive_method/deactivated', { headers })
}

export const postAddAcceptanceMethod: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.post('/api/receive_method/create', obj, { headers })
}

export const putEditAcceptanceMethod: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { receive_method_id } = obj

  return api.put(`/api/receive_method/update/${receive_method_id}`, obj, { headers })
}

export const patchIsActiveAcceptanceMethodChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/receive_method/is_active/${id}`, obj, { headers })
}

// CARRIERS
export const getCarriers: any = (token: string, is_active?: boolean, limit?: number, offset?: number, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(name && { name }),
  };

  return api.get('/api/carrier/get', { params: queryParams, headers })
}

export const getCarrierById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { carrier_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/carrier/get/${carrier_id}`, { headers })
}

export const postAddCarriers: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/carrier/create', obj, { headers })
}

export const putEditCarriers: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { carrier_id } = obj

  return api.put(`/api/carrier/update/${carrier_id}`, obj, { headers })
}

export const patchIsActiveChangeCarrier: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/carrier/is_active/${id}`, obj, { headers })
}


// VEHICLES
export const getVehicles: any = (token: string, is_active?: boolean, limit?: number, offset?: number, is_for_requests?: boolean, plate_number?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_for_requests && { is_for_requests }),
    ...(plate_number && { plate_number }),
  };

  return api.get('/api/transport/get', { params: queryParams, headers })
}

export const getVehicleById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { transport_id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/transport/get/${transport_id}`, { headers })
}

export const postAddVehicles: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/transport/create', obj, { headers })
}

export const putEditVehicle: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/transport/update/${id}`, obj, { headers })
}

export const patchIsActiveChangeVehicle: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/transport/is_active/${id}`, obj, { headers })
}

// DRIVERS
export const getDrivers: any = (token: string, is_active?: boolean, limit?: number, offset?: number, name?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active !== null && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(name && { name }),
  };

  return api.get('/api/driver/get', {params: queryParams, headers })
}

export const getDriverById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/driver/get/${id}`, { headers })
}

export const postAddDriver: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.post('/api/driver/create', obj, { headers })
}

export const putEditDriver: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/driver/update/${id}`, obj, { headers })
}

export const patchIsActiveDriverChange: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/driver/is_active/${id}`, obj, { headers })
}

// CONCRETE MIXING PLANT
export const getConcreteMixingPlant: any = (token: string, is_desc?: boolean) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_desc !== null && { is_desc })
  };

  return api.get('/api/concrete_mixing_plant/get', {params: queryParams, headers})
}

export const putChangeCmpAndCubature: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.put(`/api/weighing/change_cmp_and_cubature/${id}`, obj, { headers })
}

export const getConcreteMixingPlantStatistics: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.get('/api/concrete_mixing_plant/get_statistics', {headers})
}


// INDEPENDENT WEIGHINGS
export const getIndependentWeighings: any = (
  token: string, is_active?: boolean, 
  limit?: number, offset?: number, 
  is_desc?: boolean, is_finished?: boolean,
  from_date?: any, to_date?: any, 
  seller_id?: any, material_id?: any, 
  order_attribute?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_desc || is_desc === false ? { is_desc } : {}),
    ...(is_finished || is_finished === false ? { is_finished } : {}),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
    ...(seller_id && { seller_id }),
    ...(material_id && { material_id }),
    ...(order_attribute && { order_attribute }),
  };

  return api.get('/api/weighing/get_independent', {params: queryParams, headers })
}

export const getIndependentById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/weighing/get_independent/${id}`, { headers })
}

export const postAddIndependentWeighings: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/weighing/create_independent', obj, { headers })
}

export const putUpdateFinishedIndependentWeighingById: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/weighing/update_finished_independent/${id}`, obj, { headers })
}

export const putFinishIndependentWeighingById: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/weighing/finish_independent/${id}`, obj, { headers })
}

export const putIsActiveChangeIndependentWeighing: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.put(`/api/weighing/is_active/${id}`, obj, { headers })
}

export const putChangeMonitoringWeighing: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/weighing/change_monitoring_data/${id}`, obj, { headers })
}

export const putIsReturnChangeIndependentWeighing: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.put(`/api/weighing/is_return/${id}`, obj, { headers })
}

// DEPENDENT WEIGHINGS
export const getDependentWeighings: any = (
  token: string, is_active?: boolean, 
  limit?: number, offset?: number, 
  is_desc?: boolean, is_finished?: boolean,
  from_date?: any, to_date?: any, request_id?: any, 
  order_attribute?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(request_id && { request_id }),
    ...(is_desc || is_desc === false ? { is_desc } : {}),
    ...(is_finished || is_finished === false ? { is_finished } : {}),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
    ...(order_attribute && { order_attribute }),
  };

  return api.get('/api/weighing/get_dependent', {params: queryParams, headers })
}

export const getDependentById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/weighing/get_dependent/${id}`, { headers })
}

export const postAddDependentWeighings: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/weighing/create_dependent', obj, { headers })
}

export const putUpdateFinishedDependentWeighingById: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/weighing/update_finished_dependent/${id}`, obj, { headers })
}

export const putFinishDependentWeighingById: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/weighing/finish_dependent/${id}`, obj, { headers })
}

export const patchIsActiveChangeDependentWeighing: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/weighing/is_active/${id}`, obj, { headers })
}


// REQUEST

export const getApplications: any = (
  token: string, is_active?: boolean, 
  limit?: number, offset?: number, 
  is_desc?: boolean, is_finished?: boolean,
  from_date?: any, to_date?: any,
  date?: any, material_id?: any, 
  object_id?: any, transport_id?: any,
  order_attribute?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_active && { is_active }),
    ...(limit && { limit }),
    ...(offset && { offset }),
    ...(is_desc || is_desc === false ? { is_desc } : {}),
    ...(is_finished || is_finished === false ? { is_finished } : {}),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
    ...(date && { date }),
    ...(material_id && { material_id }),
    ...(object_id && { object_id }),
    ...(transport_id && { transport_id }),
    ...(order_attribute && { order_attribute }),
  };

  return api.get('/api/request/get_special', {params: queryParams, headers })
}

export const getRequestById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/request/get/${id}`, { headers })
}


export const postAddRequest: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.post('/api/request/create', obj, { headers })
}

export const putRequestById: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj

  return api.put(`/api/request/update/${id}`, obj, { headers })
}

export const patchCloseRequest: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/request/close_request/${id}`, obj, { headers })
}

export const patchIsActiveChangeRequest: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const { id } = obj

  return api.patch(`/api/request/is_active/${id}`, obj, { headers })
}

export const putReconnectWeighingToRequest: any = (obj: any, token: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  const { id } = obj
  const { new_request_id } = obj

  const queryParams: any = {
    ...(new_request_id && { new_request_id }),
  }

  return api.put(`/api/weighing/reconnect_weighing/${id}`, obj, {params: queryParams, headers })
}

// ROLES
export const getRoles: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get('/api/role/get', { headers })
}

// MATERIAL TYPES
export const getMaterialTypes: any = (token: string, is_for_dependent?: boolean) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(is_for_dependent && { is_for_dependent }),
  }

  return api.get('/api/material_type/get', { params: queryParams, headers })
}

// CONSTRUCTION TYPES
export const getConstructionTypes: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.get('/api/construction_type/get', { headers })
}

// RECEIVE METHOD TYPES
export const getReceiveMethodTypes: any = (token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return api.get('/api/receive_method_type/get', { headers })
}

// REPORTS 
export const getSummaryInvoice: any = (token: string, seller_companies?: any, client_companies?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(seller_companies && { seller_companies }),
    ...(client_companies && { client_companies }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/summary_invoice', {params: queryParams, headers })
}

export const getDetailInvoice: any = (token: string, seller_companies?: any, client_companies?: any, materials?: any, carriers?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(seller_companies && { seller_companies }),
    ...(client_companies && { client_companies }),
    ...(materials && { materials }),
    ...(carriers && { carriers }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/detail_invoice', {params: queryParams, headers })
}

export const getDetailInvoiceByDeletedOrAdjusted: any = (token: string, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/detail_invoice_by_deleted_or_adjusted', {params: queryParams, headers })
}

export const getIndependentByMaterialsInvoice: any = (token: string, materials?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(materials && { materials }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/independent_by_materials_invoice', {params: queryParams, headers })
}

export const getDependentSummaryInvoice: any = (token: string, client_companies?: any, material_types?: any, objects?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(client_companies && { client_companies }),
    ...(material_types && { material_types }),
    ...(objects && { objects }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/dependent_summary_invoice', {params: queryParams, headers })
}


export const getDependentDetailInvoice: any = (token: string, client_companies?: any, materials?: any, objects?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(client_companies && { client_companies }),
    ...(materials && { materials }),
    ...(objects && { objects }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/dependent_detail_invoice', {params: queryParams, headers })
}

export const getDependentDetailInvoiceByDeletedOrAdjusted: any = (token: string, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/dependent_detail_invoice_by_deleted_or_adjusted', {params: queryParams, headers })
}

export const getDependentByMaterialsInvoice: any = (token: string, report_type?: any, from_date?: any, to_date?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(report_type && { report_type }),
    ...(from_date && { from_date }),
    ...(to_date && { to_date }),
  };
  
  return api.get('/api/report/dependent_by_materials_invoice', {params: queryParams, headers })
}

export const sendTelegramMessage: any = (obj: any, token: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const { weighing_id } = obj
  
  return api.get(`/api/weighing/send_telegram_message/${weighing_id}`, {headers })
}

// PHOTOS
export const getPhotos: any = (token: string, limit?: number, offset?: number) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const queryParams: any = {
    ...(limit && { limit }),
    ...(offset && { offset }),
  };

  return api.get('/api/photo/get', { params: queryParams, headers });
}

export const getPhotoById: any = (
  obj: any,
  token: any = localStorage.getItem('authtoken')
) => {
  const { id } = obj
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return api.get(`/api/photo/get/${id}`, { headers })
}

export default api;