import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { SettingsItemProps, SettingsProps, SettingsValues } from "../util/Types";
import { getSettingsValues, putSettingsValues } from "../io/Storage";

const SettingsSwitchItem: React.FunctionComponent<SettingsItemProps> = ({ className, id, headline, text, checked, onChange }) => {
    return <Form.Check // prettier-ignore
        type="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        className={className}
        label={
            <div className="ms-3">
                <h6>{headline}</h6>
                <p>{text}</p>
            </div>
        }
    />
}

const Settings: React.FunctionComponent<SettingsProps> = ({ show, onClose }) => {
    const [settingsValues, setSettingsValues] = useState<SettingsValues>(getSettingsValues())

    return <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Form>
                <SettingsSwitchItem
                    className="d-block"
                    id="unit-selection"
                    headline="Use Metric Units"
                    text="Changes all units in the app to the Metric system. Keeping this off reverts back to US/Imperial system."
                    checked={settingsValues.useMetric}
                    onChange={() => {
                        setSettingsValues({...settingsValues, useMetric: !settingsValues.useMetric})
                    }} />
                    
                <SettingsSwitchItem
                    className="d-block"
                    id="startup-home"
                    headline="Show home weather station on startup"
                    text="Displays weather information of the home weather station every time you open WeathAir. Keeping this off will show your last viewed weather station instead."
                    checked={settingsValues.homeOnStartup}
                    onChange={() => {
                        setSettingsValues({...settingsValues, homeOnStartup: !settingsValues.homeOnStartup})
                    }} />
                    
                <SettingsSwitchItem
                    className="d-none d-lg-block"
                    id="always-show-favorites"
                    headline="Always show favorites"
                    text="Always shows the favorites bar expanded on startup. Not available for mobile devices."
                    onChange={() => {
                        setSettingsValues({...settingsValues, alwaysShowFavorites: !settingsValues.alwaysShowFavorites})
                    }}
                    checked={settingsValues.alwaysShowFavorites} />
            </Form>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="primary" onClick={() => {
                putSettingsValues(settingsValues)
                onClose()
            }}>Save Changes</Button>
        </Modal.Footer>
    </Modal >
}

export default Settings;