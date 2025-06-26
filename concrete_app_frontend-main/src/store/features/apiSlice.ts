import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getCurrentUser,
  getCompanies,
  getMaterials,
  getObjects,
  getOffMaterials,
  getOffObjects,
  getUsers,
  postAddcompanies,
  postAddmaterials,
  postAdduser,
  postUser,
  putEditcompanies,
  putEditmaterials,
  putEdituser,
  getVehicles,
  getUserById,
  getCarriers,
  getIndependentWeighings,
  getCompanyById,
  postAddIndependentWeighings,
  getMaterialById,
  postAddCarriers,
  putEditCarriers,
  getCarrierById,
  postAddVehicles,
  getVehicleById,
  putEditVehicle,
  getIndependentById,
  getRoles,
  getMaterialTypes,
  putFinishIndependentWeighingById,
  patchIsActiveUserChange,
  patchIsActiveCompanyChange,
  patchIsActiveMaterialChange,
  patchIsActiveChangeCarrier,
  patchIsActiveChangeVehicle,
  putUpdateFinishedIndependentWeighingById,
  getSummaryInvoice,
  getDetailInvoice,
  getObjectsById,
  postAddObjects,
  putEditObjects,
  patchIsActiveObjectsChange,
  getConstructions,
  getConstructionsById,
  getOffConstructions,
  postAddConstructions,
  putEditConstructions,
  patchIsActiveConstructionsChange,
  getAcceptanceMethod,
  getAcceptanceMethodById,
  getOffAcceptanceMethod,
  postAddAcceptanceMethod,
  putEditAcceptanceMethod,
  patchIsActiveAcceptanceMethodChange,
  getApplications,
  postAddDependentWeighings,
  putUpdateFinishedDependentWeighingById,
  putFinishDependentWeighingById,
  patchIsActiveChangeDependentWeighing,
  getDependentById,
  getDependentWeighings,
  postAddRequest,
  getRequestById,
  putRequestById,
  patchCloseRequest,
  patchIsActiveChangeRequest,
  getConcreteMixingPlant,
  putReconnectWeighingToRequest,
  getDependentSummaryInvoice,
  getDependentDetailInvoice,
  getDependentByMaterialsInvoice,
  putIsActiveChangeIndependentWeighing,
  putIsReturnChangeIndependentWeighing,
  putChangeMonitoringWeighing,
  getDetailInvoiceByDeletedOrAdjusted,
  getIndependentByMaterialsInvoice,
  getDependentDetailInvoiceByDeletedOrAdjusted,
  getConstructionTypes,
  getReceiveMethodTypes,
  getPhotos,
  putChangeCmpAndCubature,
  getDrivers,
  getDriverById,
  postAddDriver,
  putEditDriver,
  patchIsActiveDriverChange,
  putEditCompanyIsDebtor,
  getPhotoById,
  getConcreteMixingPlantStatistics,
  sendTelegramMessage,
} from '../../api'
import { pageSize } from 'constDatas'

interface GeneralQueryParams {
  is_active?: boolean
  limit?: number
  offset?: number
  company_function?: any
  is_desc?: boolean
  is_finished?: any
  from_date?: any
  to_date?: any
  is_for_independent?: any
  is_for_dependent?: any
  seller_companies?: any
  seller_id?: any
  client_companies?: any
  materials?: any
  carriers?: any
  material_types?: any
  material_id?: any
  date?: any
  request_id?: any
  company_id?: any
  object_id?: any
  objects?: any
  report_type?: any
  transport_id?: any
  is_for_requests?: any
  order_attribute?: any
  name?: string
  plate_number?: string
}

export const removeFromLocalStorage = () => {
  const localStorageKeysToRemove = [
      "authtoken",
      "user",
      "username",
      "userrole",
      "userfullname",
  ];

  localStorageKeysToRemove.forEach((key) => {
      localStorage.removeItem(key);
  });
}

// USERS
export const getUsersData: any = createAsyncThunk(
  'api/getPeople',
  async ({is_active = true, limit, offset = 0}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getUsers(token, is_active, limit, offset)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getCurrentUserData: any = createAsyncThunk(
  'me',
  async (_, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getCurrentUser(token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getUserDataById: any = createAsyncThunk(
  'api/getUserById',
  async (obj, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getUserById(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const postUserData = createAsyncThunk(
  'api/postUser',
  async (obj: any) => {
    const response = await postUser(obj)
    return response.data
  }
)

export const postAddUserData: any = createAsyncThunk(
  'api/postAdduser',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAdduser(obj, token)
    return response.data
  }
)

export const putEditUserData: any = createAsyncThunk(
  'api/putEdituser',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEdituser(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeUserData: any = createAsyncThunk(
  'api/patchIsActiveUserChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveUserChange(obj, token)
    return response.data
  }
)

// COMPANIES
export const getCompaniesData: any = createAsyncThunk(
  'api/getCompanies',
  async ({is_active = true, limit, offset = 0, company_function=null, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState());
      const response = await getCompanies(token, is_active, limit, offset, company_function, name);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
);

export const getCompaniesDataById: any = createAsyncThunk(
  'api/getCompanyById',
  async (obj, { getState }) => {
    const token = selectToken(getState())
    const response = await getCompanyById(obj, token)
    return response.data
  }
)

export const postAddCompaniesData: any = createAsyncThunk(
  'api/postAddcompanies',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddcompanies(obj, token)
    return response.data
  }
)

export const putEditCompaniesData: any = createAsyncThunk(
  'api/putEditcompanies',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditcompanies(obj, token)
    return response.data
  }
)

export const putEditCompanyIsDebtorData: any = createAsyncThunk(
  'api/putEditCompanyIsDebtor',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditCompanyIsDebtor(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeCompanyData: any = createAsyncThunk(
  'api/patchIsActiveCompanyChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveCompanyChange(obj, token)
    return response.data
  }
)

// OBJECTS
export const getObjectsData: any = createAsyncThunk(
  'api/getObjects',
  async ({is_active = true, limit, offset = 0, is_for_independent, company_id, is_for_requests, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getObjects(token, is_active, limit, offset, is_for_independent, company_id, is_for_requests, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getObjectsDataById: any = createAsyncThunk(
  'api/getObjectsById',
  async (obj, { getState }) => {
    try {
        const token = selectToken(getState())
        const response = await getObjectsById(obj, token)
        return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getOffObjectsData: any = createAsyncThunk(
  'api/getOffObjects',
  async (_, { getState }) => {
    const token = selectToken(getState())
    const response = await getOffObjects(token)
    return response.data
  }
)

export const postAddObjectsData: any = createAsyncThunk(
  'api/postAddObjects',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddObjects(obj, token)
    return response.data
  }
)

export const putEditObjectsData: any = createAsyncThunk(
  'api/putEditObjects',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditObjects(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeObjectsData: any = createAsyncThunk(
  'api/patchIsActiveObjectsChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveObjectsChange(obj, token)
    return response.data
  }
)

// MATERIALS
export const getMaterialsData: any = createAsyncThunk(
  'api/getMaterials',
  async ({is_active = true, limit, offset = 0, is_for_independent, is_for_dependent, object_id, is_for_requests, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getMaterials(token, is_active, limit, offset, is_for_independent, is_for_dependent, object_id, is_for_requests, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getMaterialDataById: any = createAsyncThunk(
  'api/getMaterialById',
  async (obj, { getState }) => {
    try {
        const token = selectToken(getState())
        const response = await getMaterialById(obj, token)
        return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getOffMaterialsData: any = createAsyncThunk(
  'api/getOffMaterials',
  async (_, { getState }) => {
    const token = selectToken(getState())
    const response = await getOffMaterials(token)
    return response.data
  }
)

export const postAddmaterialsData: any = createAsyncThunk(
  'api/postAddmaterials',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddmaterials(obj, token)
    return response.data
  }
)

export const putEditMaterialsData: any = createAsyncThunk(
  'api/putEditmaterials',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditmaterials(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeMaterialData: any = createAsyncThunk(
  'api/patchIsActiveMaterialChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveMaterialChange(obj, token)
    return response.data
  }
)

// CONSTRUCTIONS
export const getConstructionsData: any = createAsyncThunk(
  'api/getConstructions',
  async ({is_active = true, limit, offset = 0, is_for_independent, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getConstructions(token, is_active, limit, offset, is_for_independent, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getConstructionsDataById: any = createAsyncThunk(
  'api/getConstructionsById',
  async (obj, { getState }) => {
    try {
        const token = selectToken(getState())
        const response = await getConstructionsById(obj, token)
        return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getOffConstructionsData: any = createAsyncThunk(
  'api/getOffConstructions',
  async (_, { getState }) => {
    const token = selectToken(getState())
    const response = await getOffConstructions(token)
    return response.data
  }
)

export const postAddConstructionsData: any = createAsyncThunk(
  'api/postAddConstructions',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddConstructions(obj, token)
    return response.data
  }
)

export const putEditConstructionsData: any = createAsyncThunk(
  'api/putEditConstructions',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditConstructions(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeConstructionsData: any = createAsyncThunk(
  'api/patchIsActiveConstructionsChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveConstructionsChange(obj, token)
    return response.data
  }
)

// ACCEPTANCE-METHOD
export const getAcceptanceMethodData: any = createAsyncThunk(
  'api/getAcceptanceMethod',
  async ({is_active = true, limit, offset = 0, is_for_independent, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getAcceptanceMethod(token, is_active, limit, offset, is_for_independent, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getAcceptanceMethodDataById: any = createAsyncThunk(
  'api/getAcceptanceMethodById',
  async (obj, { getState }) => {
    try {
        const token = selectToken(getState())
        const response = await getAcceptanceMethodById(obj, token)
        return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getOffAcceptanceMethodData: any = createAsyncThunk(
  'api/getOffAcceptanceMethod',
  async (_, { getState }) => {
    const token = selectToken(getState())
    const response = await getOffAcceptanceMethod(token)
    return response.data
  }
)

export const postAddAcceptanceMethodData: any = createAsyncThunk(
  'api/postAddAcceptanceMethod',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddAcceptanceMethod(obj, token)
    return response.data
  }
)

export const putEditAcceptanceMethodData: any = createAsyncThunk(
  'api/putEditAcceptanceMethod',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditAcceptanceMethod(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeAcceptanceMethodData: any = createAsyncThunk(
  'api/patchIsActiveAcceptanceMethodChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveAcceptanceMethodChange(obj, token)
    return response.data
  }
)

// CARRIERS
export const getCarrierData: any = createAsyncThunk(
  'api/getCarriers',
  async ({is_active = true, limit, offset = 0, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getCarriers(token, is_active, limit, offset, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getCarrierDataById: any = createAsyncThunk(
  'api/getCarrierById',
  async (obj, { getState }) => {
    const token = selectToken(getState())
    const response = await getCarrierById(obj, token)
    return response.data
  }
)

export const postAddCarriersData: any = createAsyncThunk(
  'api/postAddCarriers',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddCarriers(obj, token)
    return response.data
  }
)

export const putEditCarriersData: any = createAsyncThunk(
  'api/putEditCarriers',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditCarriers(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeCarrierData: any = createAsyncThunk(
  'api/patchIsActiveChangeCarrier',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveChangeCarrier(obj, token)
    return response.data
  }
)

// VEHICLES
export const getVehicleData: any = createAsyncThunk(
  'api/getVehicles',
  async ({is_active = true, limit, offset = 0, is_for_requests, plate_number}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getVehicles(token, is_active, limit, offset, is_for_requests, plate_number)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getVehicleDataById: any = createAsyncThunk(
  'api/getVehicleById',
  async (obj, { getState }) => {
    const token = selectToken(getState())
    const response = await getVehicleById(obj, token)
    return response.data
  }
)

export const postAddVehicleData: any = createAsyncThunk(
  'api/postAddVehicles',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddVehicles(obj, token)
    return response.data
  }
)

export const putEditVehicleData: any = createAsyncThunk(
  'api/putEditVehicle',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditVehicle(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeVehicleData: any = createAsyncThunk(
  'api/patchIsActiveChangeVehicle',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveChangeVehicle(obj, token)
    return response.data
  }
)

// DRIVERS
export const getDriversData: any = createAsyncThunk(
  'api/getDrivers',
  async ({is_active = true, limit, offset = 0, name}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDrivers(token, is_active, limit, offset, name)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDriverDataById: any = createAsyncThunk(
  'api/getDriverById',
  async (obj, { getState }) => {
    try {
        const token = selectToken(getState())
        const response = await getDriverById(obj, token)
        return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const postAddDriverData: any = createAsyncThunk(
  'api/postAddDriver',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddDriver(obj, token)
    return response.data
  }
)

export const putEditDriverData: any = createAsyncThunk(
  'api/putEditDriver',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putEditDriver(obj, token)
    return response.data
  }
)

export const patchIsActiveChangeDriverData: any = createAsyncThunk(
  'api/patchIsActiveDriverChange',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await patchIsActiveDriverChange(obj, token)
    return response.data
  }
)

// CONCRETE MIXING PLANT
export const getConcreteMixingPlantData: any = createAsyncThunk(
  'api/getConcreteMixingPlant',
  async ({is_desc=false}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getConcreteMixingPlant(token, is_desc)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const putChangeCmpAndCubatureData: any = createAsyncThunk(
  'api/putChangeCmpAndCubature',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putChangeCmpAndCubature(obj, token)
    return response.data
  }
)

export const getConcreteMixingPlantStatisticsData: any = createAsyncThunk(
  'api/getConcreteMixingPlantStatistics',
  async (_, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getConcreteMixingPlantStatistics(token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// INDEPENDENT WEIGHING
export const getIndependentWeighingsData: any = createAsyncThunk(
  'api/getIndependentWeighings',
  async ({is_active = true, limit = pageSize, offset = 0, is_desc=true, is_finished, from_date, to_date, seller_id, material_id, order_attribute}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getIndependentWeighings(token, is_active, limit, offset, is_desc, is_finished, from_date, to_date, seller_id, material_id, order_attribute)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getIndependentWeighingDataById: any = createAsyncThunk(
  'api/getIndependentById',
  async (obj, { getState }) => {
    try{
      const token = selectToken(getState())
      const response = await getIndependentById(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const postAddIndependentWeighingsData: any = createAsyncThunk(
  'api/postAddIndependentWeighings',
  async (obj: any, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await postAddIndependentWeighings(obj, token)
      return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const putUpdateFinishedIndependentWeighingByIdData: any = createAsyncThunk(
  'api/putUpdateFinishedIndependentWeighingById',
  async (obj: any, { getState }) => {
    try{
      const token = selectToken(getState())
      const response = await putUpdateFinishedIndependentWeighingById(obj, token)
      return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const putFinishIndependentWeighingsData: any = createAsyncThunk(
  'api/putFinishIndependentWeighingById',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putFinishIndependentWeighingById(obj, token)
    return response.data
  }
)

export const putIsActiveChangeIndependentWeighingData: any = createAsyncThunk(
  'api/putIsActiveChangeIndependentWeighing',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putIsActiveChangeIndependentWeighing(obj, token)
    return response.data
  }
)

export const putChangeMonitoringWeighingData: any = createAsyncThunk(
  'api/putChangeMonitoringWeighing',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putChangeMonitoringWeighing(obj, token)
    return response.data
  }
)

export const putIsReturnChangeIndependentWeighingData: any = createAsyncThunk(
  'api/putIsReturnChangeIndependentWeighing',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putIsReturnChangeIndependentWeighing(obj, token)
    return response.data
  }
)

// DEPENDENT WEIGHING
export const getDependentWeighingsData: any = createAsyncThunk(
  'api/getDependentWeighings',
  async ({is_active = true, limit = pageSize, offset = 0, is_desc=true, is_finished, from_date, to_date, request_id, order_attribute}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentWeighings(token, is_active, limit, offset, is_desc, is_finished, from_date, to_date, request_id, order_attribute)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDependentWeighingDataById: any = createAsyncThunk(
  'api/getDependentById',
  async (obj, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentById(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const postAddDependentWeighingsData: any = createAsyncThunk(
  'api/postAddDependentWeighings',
  async (obj: any, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await postAddDependentWeighings(obj, token)
      return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const putUpdateFinishedDependentWeighingByIdData: any = createAsyncThunk(
  'api/putUpdateFinishedDependentWeighingById',
  async (obj: any, { getState }) => {
    try {
    const token = selectToken(getState())
    const response = await putUpdateFinishedDependentWeighingById(obj, token)
    return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
  }
  }
)

export const putFinishDependentWeighingsData: any = createAsyncThunk(
  'api/putFinishDependentWeighingById',
  async (obj: any, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await putFinishDependentWeighingById(obj, token)
      return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const patchIsActiveChangeDependentWeighingData: any = createAsyncThunk(
  'api/patchIsActiveChangeDependentWeighing',
  async (obj: any, { getState }) => {
  try{
    const token = selectToken(getState())
    const response = await patchIsActiveChangeDependentWeighing(obj, token)
    return response.data
  } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
  }
  }
)

// REQUEST
export const getApplicationsData: any = createAsyncThunk(
  'api/getApplications',
  async ({is_active = true, limit, offset = 0, is_desc=false, is_finished, from_date, to_date, date, material_id, object_id, transport_id, order_attribute}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getApplications(token, is_active, limit, offset, is_desc, is_finished, from_date, to_date, date, material_id, object_id, transport_id, order_attribute)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getRequestDataById: any = createAsyncThunk(
  'api/getRequestById',
  async (obj, { getState }) => {
    try{
      const token = selectToken(getState())
      const response = await getRequestById(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const putRequestDataById: any = createAsyncThunk(
  'api/putRequestById',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await putRequestById(obj, token)
    return response.data
  }
)


export const postAddRequestData: any = createAsyncThunk(
  'api/postAddRequest',
  async (obj: any, { getState }) => {
    const token = selectToken(getState())
    const response = await postAddRequest(obj, token)
    return response.data
  }
)

export const patchCloseRequestData: any = createAsyncThunk(
  'api/patchCloseRequest',
  async (obj: any, { getState, rejectWithValue }) => {
  try{
    const token = selectToken(getState())
    const response = await patchCloseRequest(obj, token)
    return response.data
  } catch (error: any) {
    if (error?.response) {
      return rejectWithValue({
        message: error.response.data.message,
        status: error.response.status,
      });
    }
  }
  }
)

export const patchIsActiveChangeRequestData: any = createAsyncThunk(
  'api/patchIsActiveChangeRequest',
  async (obj: any, { getState }) => {
    try {
      const token = selectToken(getState());
      const response = await patchIsActiveChangeRequest(obj, token);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

export const putReconnectWeighingToRequestData: any = createAsyncThunk(
  'api/putReconnectWeighingToRequest',
  async (obj: any, { getState }) => {
    try{
    const token = selectToken(getState())
    const response = await putReconnectWeighingToRequest(obj, token)
    return response.data
    } catch (error: any) {
      return { error: error.response.data, statusCode: error.response.status};
    }
  }
)

// ROLES
export const getRolesData: any = createAsyncThunk(
  'api/getRoles',
  async (_, { getState }) => {
    try{
      const token = selectToken(getState())
      const response = await getRoles(token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// MATERIAL TYPES
export const getMaterialTypesData: any = createAsyncThunk(
  'api/getMaterialTypes',
  async ({is_for_dependent}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getMaterialTypes(token, is_for_dependent)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// CONSTRUCTION TYPES
export const getConstructionTypesData: any = createAsyncThunk(
  'api/getConstructionTypes',
  async (_, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getConstructionTypes(token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// RECEIVE METHOD TYPES
export const getReceiveMethodTypesData: any = createAsyncThunk(
  'api/getReceiveMethodTypes',
  async (_, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getReceiveMethodTypes(token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// REPORTS
export const getSummaryInvoiceData: any = createAsyncThunk(
  'api/getSummaryInvoice',
  async ({seller_companies, client_companies, from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getSummaryInvoice(token, seller_companies, client_companies, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDetailInvoiceData: any = createAsyncThunk(
  'api/getDetailInvoice',
  async ({seller_companies, client_companies, materials, carriers, from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      console.log(carriers)
      const response = await getDetailInvoice(token, seller_companies, client_companies, materials, carriers, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDetailInvoiceByDeletedOrAdjustedData: any = createAsyncThunk(
  'api/getDetailInvoiceByDeletedOrAdjusted',
  async ({from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDetailInvoiceByDeletedOrAdjusted(token, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getIndependentByMaterialsInvoiceData: any = createAsyncThunk(
  'api/getIndependentByMaterialsInvoice',
  async ({materials, from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getIndependentByMaterialsInvoice(token, materials, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const sendTelegramMessageData: any = createAsyncThunk(
  'api/sendTelegramMessage',
  async (obj: any, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await sendTelegramMessage(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDependentSummaryInvoiceData: any = createAsyncThunk(
  'api/getDependentSummaryInvoice',
  async ({client_companies, from_date, material_types, objects, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentSummaryInvoice(token, client_companies, material_types, objects, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDependentDetailInvoiceData: any = createAsyncThunk(
  'api/getDependentDetailInvoice',
  async ({client_companies, materials, objects, from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentDetailInvoice(token, client_companies, materials, objects, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDependentDetailInvoiceByDeletedOrAdjustedData: any = createAsyncThunk(
  'api/getDependentDetailInvoiceByDeletedOrAdjusted',
  async ({from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentDetailInvoiceByDeletedOrAdjusted(token, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

export const getDependentByMaterialsInvoiceData: any = createAsyncThunk(
  'api/getDependentByMaterialsInvoice',
  async ({report_type, from_date, to_date}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState())
      const response = await getDependentByMaterialsInvoice(token, report_type, from_date, to_date)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)

// Photos
export const getPhotosData: any = createAsyncThunk(
  'api/getPhotos',
  async ({limit, offset = 0}: GeneralQueryParams = {}, { getState }) => {
    try {
      const token = selectToken(getState());
      const response = await getPhotos(token, limit, offset);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
);


export const getPhotoDataById: any = createAsyncThunk(
  'api/getPhotoById',
  async (obj, { getState }) => {
    try{
      const token = selectToken(getState())
      const response = await getPhotoById(obj, token)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeFromLocalStorage();
      }
    }
  }
)


interface TState {
  data: any[] | undefined
  loading: boolean | undefined
  error: any | undefined
  token: any | undefined
  hide: boolean | undefined
  user: string | null | undefined
}

const initialState: TState = {
  data: undefined,
  loading: false,
  error: undefined,
  token: localStorage.getItem('authtoken'),
  hide: true,
  user: localStorage.getItem('user'),
}

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    },
    setHide: (state, action) => {
      state.hide = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsersData.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(getUsersData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })

      .addCase(getUsersData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(getCurrentUserData.fulfilled, (state, action) => {
        state.user = action.payload.data;
      })

      .addCase(setHide, (state, action) => {
        state.hide = action.payload
      })

      .addCase(setUser, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { setToken, setHide, setUser } = apiSlice.actions
export const selectUser = (state: any) => state.api.user
export const selectHide = (state: any) => state.api.hide
export const selectToken = (state: any) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('supplier_token') || localStorage.getItem('authtoken');
  }
  return undefined;
}
export default apiSlice.reducer
