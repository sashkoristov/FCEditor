import Main from './components/Main';
import Dashboard from './components/Dashboard';
import WorkflowEditor from './components/WorkflowEditor';
import Functions from './components/Functions';
import Settings from './components/Settings';

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
    { path: '/dashboard', exact: true, name: 'Home', component: Dashboard },
    { path: '/editor', exact: true, name: 'Editor', component: WorkflowEditor },
    { path: '/functions', exact: true, name: 'Functions', component: Functions },
    { path: '/settings', exact: true, name: 'Settings', component: Settings },
];

export default routes;