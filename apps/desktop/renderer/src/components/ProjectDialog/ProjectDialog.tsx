import {Form, Input, Modal} from 'antd';
import DesktopFormItem from './DesktopFormItem/DesktopFormItem';
import FormFooter from './FormFooter/FormFooter';
import MobileFormItem from './MobileFormItem/MobileFormItem';
import './ProjectDialog.css';
import ServerFormItem from './ServerFormItem/ServerFormItem';
import WebFormItem from './WebFormItem/WebFormItem';

const defaultProjectConfig = {
  name: '',
  react: {
    name: 'web',
    path: 'apps',
    useTypeScript: true,
    framework: 'vite',
  },
  node: {
    name: 'server',
    path: 'apps',
    useTypeScript: true,
  },
  reactNative: {
    name: 'mobile',
    path: 'apps',
    useTypeScript: false,
  },
  electron: {
    name: 'desktop',
    path: 'apps',
    useTypeScript: true,
  },
};

type Props = {
  onCancel: () => void;
  onConfirm: (config: {name: string; [key: string]: any}) => void;
};

function ProjectDialog({onCancel, onConfirm}: Props) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onConfirm(values);
  };

  return (
    <Modal open title="Enter Project Details" onCancel={onCancel} footer={null}>
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultProjectConfig}
        onFinish={onFinish}
      >
        <Form.Item
          label="Project Name"
          name="name"
          rules={[{required: true, message: 'Please input project name!'}]}
        >
          <Input />
        </Form.Item>
        <ServerFormItem />
        <WebFormItem />
        <MobileFormItem />
        <DesktopFormItem />
        <FormFooter onCancel={onCancel} />
      </Form>
    </Modal>
  );
}

export default ProjectDialog;
