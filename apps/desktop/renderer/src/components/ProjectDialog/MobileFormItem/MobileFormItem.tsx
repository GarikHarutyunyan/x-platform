import {Form, Input, Switch} from 'antd';
import {useState} from 'react';

const MobileFormItem = () => {
  const [showInputs, setShowInputs] = useState(false);

  return (
    <>
      <Form.Item label="Mobile" valuePropName="checked" layout="horizontal">
        <Switch onChange={setShowInputs} />
      </Form.Item>
      {showInputs ? (
        <>
          <Form.Item
            label="Project Name"
            name={['reactNative', 'name']}
            rules={[{required: true, message: 'Please input project name!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Project Path"
            name={['reactNative', 'path']}
            rules={[{required: true, message: 'Please input project path!'}]}
            layout="horizontal"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Use TypeScript"
            name={['reactNative', 'useTypeScript']}
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

export default MobileFormItem;
