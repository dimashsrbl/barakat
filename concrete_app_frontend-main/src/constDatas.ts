import dayjs from 'dayjs'

export const pageSize: number = 10;
export const photoLimit: number = 7;
export const numberRegex = /^-?\d*\d*$|^Backspace$|^Delete$|^Escape$^$/;
export const purposeCubatureRegex = /^-?\d*\.?\d*$|^Backspace$|^Delete$|^Escape$/;

// menuData.ts
export const roleData: any = [
  { key: '1', label: 'Директор' },
  { key: '2', label: 'Учредитель' },
  { key: '3', label: 'Руководитель отдела продаж' },
  { key: '4', label: 'Менеджер отдела продаж' },
  { key: '5', label: 'Диспетчер весовой' },
  { key: '6', label: 'Логист' },
  { key: '7', label: 'Лаборант' },
]

export const companyTypes: any = [
  { key: '1', label: 'ТОО' },
  { key: '2', label: 'ИП' },
  { key: '3', label: 'ЧЛ' },
  { key: '4', label: 'АО' },
  { key: '5', label: 'Филиал' },
]

export const companyFunctionConst: any = [
  { key: '1', label: 'Все' },
  { key: '2', label: 'Заказчик' },
  { key: '3', label: 'Поставщик' },
  { key: '4', label: 'Наша' },
]

export const bornData: any = [
  { key: '1', label: 'Все' },
  { key: '2', label: 'Эверест' },
  { key: '3', label: 'Северный' },
  { key: '4', label: 'Козыкош' },
]
export const allUnits: any = [
  { key: '1', label: 'Тонны' },
  { key: '2', label: 'Кубы' },
]

export const isActiveTypes: any = [
  { key: '1', label: 'Активные' },
  { key: '2', label: 'Неактивные' },
]

export const completeUncompleteTypes: any = [
  { key: '1', label: 'Все'},
  { key: '2', label: 'Завершенные' },
  { key: '3', label: 'Незавершенные' },
]

export const sortingTypes: any = [
  { key: '1', label: 'От новых к старым'},
  { key: '2', label: 'От старых к новым' }
]


export const materialTypes: any = [
  { key: '1', label: 'Раствор' },
  { key: '2', label: 'Керамзитобетон' },
  { key: '3', label: 'Пескобетон' },
  { key: '4', label: 'Высокомарочный бетон' },
  { key: '5', label: 'Железобетон/ЖБИ' },
  { key: '6', label: 'Прочее' },
]

export const reportTypes: any = [
  { key: '1', label: 'Сводный отчет' },
  { key: '2', label: 'Детальный отчет' },
  { key: '3', label: 'Отчет по удаленным и корректированным отвесам'},
  { key: '4', label: 'Отчет по материалам'}
]

export const applicationReportTypes: any = [
  { key: '1', label: 'Сводный отчет' },
  { key: '2', label: 'Детальный отчет' },
  { key: '3', label: 'Отчет по маркам б/р' },
  { key: '4', label: 'Отчет по удаленным и корректированным отвесам'},
]

export const constructionTypes: any = [
  { key: '1', label: 'Вертикальная' },
  { key: '2', label: 'Горизонтальная' },
]

export const reporGrouppingTypes: any = [
  { key: '1', label: 'По дням' },
  { key: '2', label: 'По месяцам' },
]

export const parseCompanyType = (data: string | any) =>
  companyTypeTranslations[data] || data
export const parseRole = (data: string | any) => roleTranslations[data] || data
export const parseShip = (data: string | any) =>
  shippingTranslations[data] || data
export const parsePriority = (data: string | any) =>
  priorityTranslations[data] || data
export const parseLimit = (data: string | any) =>
  limitTranslations[data] || data
export const parseUnit = (data: string | any) => unitTranslations[data] || data
export const parseStatus = (data: string | any) =>
  statusTranslations[data] || data
export const parseCompanyFunction = (data: string | any) =>
  companyFunctionTranslations[data] || data
export const parseWeighingHistory = (data: string | any) =>
  weighingHistoryTranslations[data] || data

export const parseFulfilling = (data: string | any) =>
  data
    ? data === 'Min'
      ? 'Дневной минимум (min)'
      : 'Дневной максимум (max)'
    : 'Неизвестно'

export const parseDate = (data: string): string =>
  data ? dayjs(data).format('DD.MM.YYYY HH:mm') : '';

export const parseDateWithoutTime = (data: string): string =>
  data ? dayjs(data).format('DD.MM.YYYY') : '';

export const parseTime = (data: string): string =>
  data ? dayjs(data).format('HH:mm:ss') : '';

  export const parseTimeWithoutSecond = (data: string): string =>
  data ? dayjs(data).format('HH:mm') : '';

export const getDate = (text: string) => {
  const now = new Date();
  const real = now.toISOString().slice(0, 19).replace('T', ' ').split(' ');
  if (text === 'today') return `${real[0]} 00:00:00`
  if (text === 'tomorow') return `${real[0]} 23:59:59`
}

export const formatAPIDateTime = (date: any) => {
  return date ? dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSSSSS') : 'Неизвестно';
};

export const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

const companyTypeTranslations: any = {
  'ИП': 'IP',
  'Частное лицо': 'PP',
  'ТОО': 'TOO',
  'АО': 'AO',
  'Филиал': 'Filial',
  TOO: 'ТОО',
  IP: 'ИП',
  PP: 'Частное лицо',
  AO: 'АО',
  Filial: 'Филиал',
}

const roleTranslations: any = {
  'Учредитель': 'admin',
  'Диспетчер весовой': 'weighing_dispatcher',
  'Директор': 'plant_director',
  'Руководитель отдела продаж': 'sales_head',
  'Менеджер отдела продаж': 'sales_manager',
  'Логист': 'logist',
  'Лаборант': 'laborant',
  plant_director: 'Директор',
  admin: 'Учредитель',
  weighing_dispatcher: 'Диспетчер весовой',
  sales_head: 'Руководитель отдела продаж',
  sales_manager: 'Менеджер отдела продаж',
  logist: 'Логист',
  laborant: 'Лаборант'
}

const shippingTranslations: any = {
  Employee: 'Наёмник',
  Pickup: 'Самовывоз',
  SalesDepartment: 'Отдел сбыта',
  Delivery: 'Доставка',
  Наёмник: 'Employee',
  Самовывоз: 'Pickup',
  'Отдел сбыта': 'SalesDepartment',
  'Доставка': 'Delivery',
}

const priorityTranslations: any = {
  Low: 'Низкий',
  Normal: 'Средний',
  High: 'Высокий',
  Низкий: 'Low',
  Средний: 'Normal',
  Высокий: 'High',
}

const limitTranslations: any = {
  No: 'Отсутствует',
  Low: '10%',
  Normal: '20%',
  High: '30%',
  Отсутствует: 'No',
  '10%': 'Low',
  '20%': 'Normal',
  '30%': 'High',
}

const unitTranslations: any = {
  Tons: 'Тонны',
  Cubes: 'Кубы',
  Тонны: 'Tons',
  Кубы: 'Cubes',
}

const companyFunctionTranslations: any = {
  All: 'Все',
  Customer: 'Заказчик',
  Provider: 'Поставщик',
  Поставщик: 'Provider',
  Заказчик: 'Customer',
  Все: 'All'
}

const statusTranslations: any = {
  Open: 'Открыто',
  OpenTodayNotFinished: 'Открытые, Незавершенные на сегодня',
  OpenTodayFinished: 'Открытые, Завершенные на сегодня',
  Finished: 'Полностью завершенные',
  Deactivated: 'Деактивированные',
  'Полностью завершенные': 'Finished',
  Деактивированные: 'Deactivated',
  'Открытые, Завершенные на сегодня': 'OpenTodayFinished',
  'Открытые, Незавершенные на сегодня': 'OpenTodayNotFinished',
  'Открытые': 'Open',
  Sended: 'Отправлен',
  Canceled: 'Отменено',
  Отправлен: 'Sended',
  Отменено: 'Canceled',
}

const weighingHistoryTranslations: any = {
  "WeighingState.Canceled": "Отменено",
  "WeighingState.Sended": "Отправлено",
  "cubic_capacity": "Кубатура",
  "operator_name": "ФИО водителя",
  "car_number": "Гос.номер",
  "rq_date_create": "Дата создания",
  "requisition_id": "ID заявки",
  "weight_gross": "Брутто",
  "weight_netto": "Нетто",
  "weight_tare": "Тара",
  "status": "Статус",
  "ts_weighing_id": "ID TS"
}
