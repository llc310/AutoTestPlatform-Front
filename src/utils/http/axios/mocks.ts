// 这里按需导入 mock 文件，只有在这里导入并导出，才会注册 mock 拦截
import UserMock from '../../../../mock/user';
import MenusMock from '../../../../mock/user/menus';
import ConsoleMock from '../../../../mock/dashboard/console';
import TableMock from '../../../../mock/table/list';
import SystemMenuMock from '../../../../mock/system/menu';
import SystemRoleMock from '../../../../mock/system/role';

// defineMock 返回 { enable, data }，真正的路由定义在 .data 中（键格式：[METHOD]/url 或 /url）
export const mocks = Object.assign(
  {},
  UserMock.data,
  MenusMock.data,
  ConsoleMock.data,
  TableMock.data,
  SystemMenuMock.data,
  SystemRoleMock.data
);
