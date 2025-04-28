import {Form, Input, Switch} from 'antd';
import {useState} from 'react';

const ServerFormItem = () => {
  const [showInputs, setShowInputs] = useState(false);

  return (
    <>
      <Form.Item label="Server" valuePropName="checked" layout="horizontal">
        <Switch onChange={setShowInputs} />
      </Form.Item>
      {showInputs ? (
        <>
          <Form.Item
            label="Project Name"
            name={['node', 'name']}
            rules={[{required: true, message: 'Please input project name!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Project Path"
            name={['node', 'path']}
            rules={[{required: true, message: 'Please input project path!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Use TypeScript"
            name={['node', 'useTypeScript']}
            valuePropName="checked"
            layout="horizontal"
          >
            <Switch />
          </Form.Item>
        </>
      ) : null}
    </>
  );
};

export default ServerFormItem;
