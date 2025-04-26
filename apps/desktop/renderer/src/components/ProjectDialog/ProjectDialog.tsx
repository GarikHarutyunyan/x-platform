import './ProjectDialog.css';

type Props = {
  projectConfig: { name: string, [key: string]: any };
  onChange: (config: { name: string, [key: string]: any }) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function ProjectDialog({ projectConfig, onChange, onCancel, onConfirm }: Props) {

  const onConfigChange = (name: string, value: string | boolean) => {
    onChange({...projectConfig, [name]: value})
  } 

  const onCheckboxChange = (e: any) => onConfigChange(e.target.name, e.target.checked)

  return (
    <div className="project-dialog__overlay">
      <div className="project-dialog__container">
        <h3>Enter Project Name</h3>
        <input
          type="text"
          value={projectConfig.name}
          onChange={(e) => onConfigChange('name', e.target.value)}
          className="project-dialog__input"
        />
        <input type="checkbox" name="server" checked={projectConfig?.server} onChange={onCheckboxChange}/>
        <label htmlFor="server"> Server</label><br />
        <input type="checkbox" name="web" checked={projectConfig?.web} onChange={onCheckboxChange}/>
        <label htmlFor="web"> Web</label><br />
        <input type="checkbox" name="mobile" checked={projectConfig?.mobile} onChange={onCheckboxChange}/>
        <label htmlFor="mobile"> Mobile</label><br/>
        <input type="checkbox" name="desktop" checked={projectConfig?.desktop} onChange={onCheckboxChange}/>
        <label htmlFor="desktop"> Desktop</label><br/><br/>
        <button onClick={onConfirm}>Create</button>{' '}
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ProjectDialog;