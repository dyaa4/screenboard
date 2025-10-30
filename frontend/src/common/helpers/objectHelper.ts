import { ROUTE_DASHBOARD_ID } from '@common/routes';

/**
 *  Sorts a list of objects by a property name
 * @param objectList  list of objects to sort
 * @param propertyName  name of the property to sort by
 * @returns
 */
export const sortListByProperty = <T>(
  objectList: T[],
  propertyName: string,
) => {
  return objectList.sort((a: any, b: any) => a[propertyName] - b[propertyName]);
};

/**
 *  Gets the name of a property from a property function
 * @param propertyFunction  function that returns a property of an object
 * @returns  name of the property
 */
export function getPropertyName<T>(propertyFunction: (obj: T) => any): keyof T {
  const propertyName = propertyFunction.toString().match(/\.([^\.;]+);?$/)?.[1];
  return propertyName as keyof T;
}

export const replaceDashboardId = (
  url: string,
  dashboardId: string | undefined,
) => {
  if (!dashboardId) {
    throw new Error('Dashboard ID is required');
  }
  return url.replace(ROUTE_DASHBOARD_ID, dashboardId);
};
