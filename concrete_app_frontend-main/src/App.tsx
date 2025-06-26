import { useEffect } from 'react'
import { Route, Routes, Outlet, useNavigate } from 'react-router-dom'

import { NavigateToLogin } from './navigatetologin'
import { LoginPage } from './pages/Login/LoginPage'
import { MainLayout } from './layout/MainLayout'

// UsersPage
import { UserPage } from './pages/User/UserPage'
import { UserAddPage } from 'pages/User/UserAdd/UserAddPage'
import { UserEditPage } from 'pages/User/UserEdit/UserEditPage'

// PlumbLog Pages
import { PlumbLogPage } from './pages/PlumbLog/PlumbLogPage'

// List Pages
import { ListPage } from './pages/List/ListPage'
import { Companies } from './pages/List/components/Companies/Companies'
import { Objects } from './pages/List/components/Objects/Objects'
import { Materials } from './pages/List/components/Materials/Materials'
import { Constructions } from './pages/List/components/Constructions/Constructions'
import { AcceptanceMethod } from './pages/List/components/AcceptanceMethod/AcceptanceMethod'
import { Carrier } from './pages/List/components/Carrier/Carrier'
import { Vehicle } from './pages/List/components/Vehicle/Vehicle'
import { CompaniesAddPage } from 'pages/List/components/Companies/CompaniesAdd/CompaniesAddPage'
import { ObjectsAddPage } from 'pages/List/components/Objects/ObjectsAdd/ObjectsAddPage'
import { CompaniesEditPage } from 'pages/List/components/Companies/CompaniesEdit/CompaniesEditPage'
import { ObjectsEditPage } from 'pages/List/components/Objects/ObjectsEdit/ObjectsEditPage'
import { MaterialsAddPage } from 'pages/List/components/Materials/MaterialsAdd/MaterialsAddPage'
import { MaterialsEditPage } from 'pages/List/components/Materials/MaterialsEdit/MaterialsEditPage'
import { ConstructionsAddPage } from 'pages/List/components/Constructions/ConstructionsAdd/ConstructionsAddPage'
import { ConstructionsEditPage } from 'pages/List/components/Constructions/ConstructionsEdit/ConstructionsEditPage'
import { AcceptenceMethodAddPage } from 'pages/List/components/AcceptanceMethod/AcceptenceMethodAdd/AcceptenceMethodAddPage'
import { AcceptenceMethodEditPage } from 'pages/List/components/AcceptanceMethod/AcceptenceMethodEdit/AcceptenceMethodEditPage'
import { CarrierAddPage } from 'pages/List/components/Carrier/CarrierAdd/CarrierAddPage'
import { CarrierEditPage } from 'pages/List/components/Carrier/CarrierEdit/CarrierEditPage'
import { VehicleAddPage } from 'pages/List/components/Vehicle/VehicleAdd/VehicleAddPage'
import { VehicleEditPage } from 'pages/List/components/Vehicle/VehicleEdit/VehicleEditPage'
import { PlumbLogAddPage } from 'pages/PlumbLog/PlumbLogAdd/PlumbLogAddPage'
import { PlumbLogEditPage } from 'pages/PlumbLog/PlumbLogEdit/PlumbLogEditPage'
import { PlumbLogViewPage } from 'pages/PlumbLog/PlumbLogView/PlumbLogViewPage'
import { ReportPage } from 'pages/Reports/ReportPage'
import { WeighingReportPage } from 'pages/Reports/components/WeighingReport/WeighingReportPage'
import { ApplicationReportPage } from 'pages/Reports/components/ApplicationReport/ApplicationReportPage'
import { ApplicationPlanPage } from 'pages/ApplicationPlan/ApplicationPlanPage'
import { ApplicationLogPage } from 'pages/ApplicationLog/ApplicationLogPage'
import { ApplicationLogView } from 'pages/ApplicationLog/ApplicationLogView/ApplicationLogView'
import { ApplicationAddPage } from 'pages/ApplicationPlan/ApplicationAdd/ApplicationAdd'
import { ApplicationEditPage } from 'pages/ApplicationPlan/ApplicationEdit/ApplicationEdit'
import { ApplicationPlumbLogAddPage } from 'pages/ApplicationLog/ApplicationLogView/ApplicationPlumbLogAdd/ApplicationPlumbLogAddPage'
import { ApplicationPlumbLogEditPage } from 'pages/ApplicationLog/ApplicationLogView/ApplicationPlumbLogEdit/ApplicationPlumbLogEditPage'
import { ApplicationPlumbLogViewPage } from 'pages/ApplicationLog/ApplicationLogView/ApplicationPlumbLogView/ApplicationPlumbLogViewPage'
import { Drivers } from 'pages/List/components/Drivers/Drivers'
import { DriverAddPage } from 'pages/List/components/Drivers/DriverAdd/DriverAddPage'
import { DriverEditPage } from 'pages/List/components/Drivers/DriverEdit/DriverEditPage'
import SupplierWeighingRequestsPage from 'pages/SupplierWeighingRequests/SupplierWeighingRequestsPage'
import SupplierLoginPage from 'pages/Supplier/LoginPage'
import SupplierLayout from 'pages/Supplier/SupplierLayout'
import SupplierCreateRequestPage from 'pages/Supplier/SupplierCreateRequestPage'
import SupplierCreateTransportPage from 'pages/Supplier/SupplierCreateTransportPage'
import SupplierCreateCarrierPage from 'pages/Supplier/SupplierCreateCarrierPage'
import SupplierInvoicesPage from 'pages/Supplier/SupplierInvoicesPage'

const routes = {
  main: '/main',
  login: '/login',
  users: '/main/users',
  lists: '/main/lists',
  plumblog: '/main/plumblog',
  reports: '/main/reports',
  applicationPlan: '/main/application-plan',
  applicationLog: '/main/application-log'
};


function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authtoken');
    const currentPath = window.location.pathname;
    
    // Не перенаправляем на логин, если пользователь на supplier-маршрутах
    if (!authToken && !currentPath.startsWith('/supplier')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.main} element={<MainLayout />}>

        {/* Users */}
        <Route key="users" path={routes.users} element={<Outlet />}>
          <Route path={routes.users} element={<UserPage />}/>
          <Route path={`${routes.users}/add`} element={<UserAddPage />} />
          <Route path={`${routes.users}/edit/:id`} element={<UserEditPage />} />
        </Route>

        {/* Main List Page */}
        <Route key="lists" path={routes.lists} element={<ListPage />}>
          <Route path={routes.lists} element={<Companies />}/>
          <Route path={`${routes.lists}/objects`} element={<Objects />} />
          <Route path={`${routes.lists}/materials`} element={<Materials />} />
          <Route path={`${routes.lists}/constructions`} element={<Constructions />} />
          <Route path={`${routes.lists}/acceptance-method`} element={<AcceptanceMethod />} />
          <Route path={`${routes.lists}/carrier`} element={<Carrier />} />
          <Route path={`${routes.lists}/vehicle`} element={<Vehicle />} />
          <Route path={`${routes.lists}/drivers`} element={<Drivers />} />
        </Route>

        {/* Lists */}
        <Route path={`${routes.lists}/companies/add`} element={<CompaniesAddPage />} />
        <Route path={`${routes.lists}/companies/edit/:id`} element={<CompaniesEditPage />} />
        <Route path={`${routes.lists}/objects/add`} element={<ObjectsAddPage />} />
        <Route path={`${routes.lists}/objects/edit/:id`} element={<ObjectsEditPage />} />
        <Route path={`${routes.lists}/materials/add`} element={<MaterialsAddPage />} />
        <Route path={`${routes.lists}/materials/edit/:id`} element={<MaterialsEditPage />} />
        <Route path={`${routes.lists}/constructions/add`} element={<ConstructionsAddPage />} />
        <Route path={`${routes.lists}/constructions/edit/:id`} element={<ConstructionsEditPage />} />
        <Route path={`${routes.lists}/acceptance-method/add`} element={<AcceptenceMethodAddPage />} />
        <Route path={`${routes.lists}/acceptance-method/edit/:id`} element={<AcceptenceMethodEditPage />} />
        <Route path={`${routes.lists}/carrier/add`} element={<CarrierAddPage />} />
        <Route path={`${routes.lists}/carrier/edit/:id`} element={<CarrierEditPage />} />
        <Route path={`${routes.lists}/vehicle/add`} element={<VehicleAddPage />} />
        <Route path={`${routes.lists}/vehicle/edit/:id`} element={<VehicleEditPage />} />
        <Route path={`${routes.lists}/drivers/add`} element={<DriverAddPage />} />
        <Route path={`${routes.lists}/drivers/edit/:id`} element={<DriverEditPage />} />

        {/* Plumblog */}
        <Route key="plumblog" path={routes.plumblog} element={<PlumbLogPage />}/>
        <Route path={`${routes.plumblog}/add`} element={<PlumbLogAddPage />} />
        <Route path={`${routes.plumblog}/view/:id`} element={<PlumbLogViewPage />} />
        <Route path={`${routes.plumblog}/edit/:id`} element={<PlumbLogEditPage />} />

        {/* Reports */}
        <Route key="reports" path={routes.reports} element={<ReportPage />}>
          <Route path={`${routes.reports}`} element={<WeighingReportPage />}/>
          <Route path={`${routes.reports}/application-reports`} element={<ApplicationReportPage />} />
        </Route>

        {/* Application Plan */}
        <Route key="application-plan" path={routes.applicationPlan} element={<Outlet />}>
          <Route path={routes.applicationPlan} element={<ApplicationPlanPage />}/>
          <Route path={`${routes.applicationPlan}/add`} element={<ApplicationAddPage />} />
          <Route path={`${routes.applicationPlan}/view/:id`} element={<ApplicationLogView />} />
          <Route path={`${routes.applicationPlan}/edit/:id`} element={<ApplicationEditPage />} />
          <Route path={`${routes.applicationPlan}/view/:id/add`} element={<ApplicationPlumbLogAddPage />} />
          <Route path={`${routes.applicationPlan}/view/:id/edit/:id`} element={<ApplicationPlumbLogEditPage />} />
          <Route path={`${routes.applicationPlan}/view-plumb/:id`} element={<ApplicationPlumbLogViewPage />} />
        </Route>

        {/* Application Log */}
          <Route key="application-log" path={routes.applicationLog} element={<Outlet />}>
          <Route path={routes.applicationLog} element={<ApplicationLogPage />}/>
          <Route path={`${routes.applicationLog}/edit/:id`} element={<ApplicationEditPage />} />
          <Route path={`${routes.applicationLog}/view/:id`} element={<ApplicationLogView />} />
          <Route path={`${routes.applicationLog}/view/:id/add`} element={<ApplicationPlumbLogAddPage />} />
          <Route path={`${routes.applicationLog}/view/:id/edit/:id`} element={<ApplicationPlumbLogEditPage />} />
          <Route path={`${routes.applicationLog}/view-plumb/:id`} element={<ApplicationPlumbLogViewPage />} />
        </Route>

        {/* Supplier Weighing Requests */}
        <Route path="/main/supplier-weighing-requests" element={<SupplierWeighingRequestsPage />} />

      </Route>
      <Route path={''} element={<NavigateToLogin />} />
      <Route path="/supplier/login" element={<SupplierLoginPage onLogin={() => window.location.href = '/supplier/create-request'} />} />
      <Route path="/supplier" element={<SupplierLayout />}>
        <Route path="create-request" element={<SupplierCreateRequestPage />} />
        <Route path="create-transport" element={<SupplierCreateTransportPage />} />
        <Route path="create-carrier" element={<SupplierCreateCarrierPage />} />
        <Route path="invoices" element={<SupplierInvoicesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
