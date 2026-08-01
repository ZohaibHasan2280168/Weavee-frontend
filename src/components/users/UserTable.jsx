import { Table, Button, Space } from 'antd';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    filters: [
      { text: 'Admin', value: 'admin' },
      { text: 'Supervisor', value: 'supervisor' },
      { text: 'QA', value: 'qa' },
    ],
    onFilter: (value, record) => record.role === value,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="middle">
        <Button>Edit</Button>
        <Button danger>Delete</Button>
      </Space>
    ),
  },
];

export default function UserTable({ users }) {
  return <Table columns={columns} dataSource={users} rowKey="id" />;
}
