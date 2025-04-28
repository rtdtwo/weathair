import { Button, Col, Container, Dropdown, Image, Modal, Nav, Navbar, Row } from "react-bootstrap";
import Search from "./Search";
import { SearchOption } from "../util/Types";

type NavBarProps = {
    onSearchItemSelected: Function,
    onOptionsItemSelected: Function
}

const NavBar: React.FunctionComponent<NavBarProps> = ({ onSearchItemSelected, onOptionsItemSelected }) => {

    const searchBarComponent = <Search
        onChange={(selectedItems: SearchOption[]) => {
            if (selectedItems[0]) onSearchItemSelected(selectedItems[0])
        }} />

    const logoComponent = <img className='logo' src='/weathair/logo.png' alt='Logo of WeathAir' />

    return <>
        {/* MOBILE LAYOUT */}
        <div className="d-block d-lg-none">
            <Row className='m-0 navbar-mobile'>
                <Col xs={0} className='text-start my-3'>{logoComponent}</Col>
                <Col xs="auto" className="my-auto text-end">
                    <Dropdown>
                        <Dropdown.Toggle variant="primary-outline" >
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => onOptionsItemSelected('favorites')}>Favorites</Dropdown.Item>
                            <Dropdown.Item onClick={() => onOptionsItemSelected('settings')}>Settings</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col xs={12} className='mb-4'> {searchBarComponent} </Col>
            </Row>
        </div>
        {/* DESKTOP LAYOUT */}
        <div className="d-none d-lg-block ">
            <Row className="m-0 navbar-desktop">
                <Col lg={4} className='my-auto'>{logoComponent}</Col>
                <Col lg={4} className='my-auto'>  {searchBarComponent} </Col>
                <Col lg={4} className="my-auto text-end">
                    <img className="option-item" onClick={() => onOptionsItemSelected('settings')} src="/weathair/settings.svg" alt="Settings" />
                    <img className="ms-3 option-item" onClick={() => onOptionsItemSelected('favorites')} src="/weathair/favorite.svg" alt="Favorites" />
                </Col>
            </Row>

        </div>
    </>
}

export default NavBar;