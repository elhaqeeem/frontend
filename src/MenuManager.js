import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; // Make sure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [iconName, setIconName] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [iconId, setIconId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({}); // New state for expanded/collapsed menus

  useEffect(() => {
    fetchMenus();// eslint-disable-next-line
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get('/menus');
      if (response.data && Array.isArray(response.data.menus)) {
        const structuredMenus = structureMenus(response.data.menus);
        setMenus(structuredMenus);
      } else {
        setMenus([]);
      }
    } catch (error) {
      toast.error('Failed to fetch menus.');
      setMenus([]);
    }
  };

  const structureMenus = (menus) => {
    const menuMap = {};
    const tree = [];

    // Create a map with each menu item by its ID
    menus.forEach(menu => {
      menuMap[menu.id] = { ...menu, children: [] };
    });

    // Build the tree structure
    menus.forEach(menu => {
      if (menu.parent_id) {
        menuMap[menu.parent_id].children.push(menuMap[menu.id]);
      } else {
        tree.push(menuMap[menu.id]);
      }
    });

    return tree;
  };

  const handleCreateOrUpdate = async () => {
    const menuData = {
      menu_name: menuName,
      icon_name: iconName,
      url,
      parent_id: parentId,
      role_id: roleId,
      icon_id: iconId,
    };

    try {
      if (selectedMenu) {
        await axios.put(`/menus/${selectedMenu.id}`, menuData);
        toast.success('Menu updated successfully.');
      } else {
        await axios.post('/menus', menuData);
        toast.success('Menu created successfully.');
      }
      fetchMenus();
      resetForm();
    } catch (error) {
      toast.error('Failed to save menu.');
    }
  };

  const handleEdit = (menu) => {
    setSelectedMenu(menu);
    setMenuName(menu.menu_name);
    setIconName(menu.icon_name || '');
    setUrl(menu.url);
    setParentId(menu.parent_id || null);
    setRoleId(menu.role_id || null);
    setIconId(menu.icon_id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/menus/${id}`);
      toast.success('Menu deleted successfully.');
      fetchMenus();
    } catch (error) {
      toast.error('Failed to delete menu.');
    }
  };

  const resetForm = () => {
    setSelectedMenu(null);
    setMenuName('');
    setIconName('');
    setUrl('');
    setParentId(null);
    setRoleId(null);
    setIconId(null);
    setIsModalOpen(false);
  };

  const toggleExpand = (menuId) => {
    setExpandedMenus(prevState => ({
      ...prevState,
      [menuId]: !prevState[menuId], // Toggle the expansion state
    }));
  };

  const filterMenus = (menus) => {
    return menus
      .filter(menu =>
        menu.menu_name.toLowerCase().includes(search.toLowerCase()) ||
        menu.url.toLowerCase().includes(search.toLowerCase()) ||
        (menu.icon_name && menu.icon_name.toLowerCase().includes(search.toLowerCase()))
      )
      .map(menu => ({
        ...menu,
        children: filterMenus(menu.children || []),
      }));
  };

  const renderMenuTree = (menus, level = 0, isLastChild = false) => {
    return (
      <ul className="menu-tree pl-4">
        {menus.map((menu, index) => {
          const isLastItem = index === menus.length - 1;
          return (
            <li key={menu.id} className={`menu-item mb-2 ${level > 0 ? 'ml-1 border-l-2 pl-1 border-gray-200' : ''}`}>
              <div className="flex justify-between items-center p-1 hover:bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  {/* Simbol hirarki berdasarkan level */}
                  <span style={{ fontFamily: 'roboto', whiteSpace: 'pre', color: '#888' }}>
                    {level > 0 && (isLastChild ? '──' : '──')}
                    {isLastItem ? '' : ''}
                  </span>
                  {menu.children.length > 0 && (
                    <button
                      onClick={() => toggleExpand(menu.id)}
                      className="text-red-500 hover:text-blue-700"
                    >
                      {expandedMenus[menu.id] ? (
                        <i className="fa fa-minus-square-o"></i>
                      ) : (
                        <i className="fa fa-plus-square-o"></i>
                      )} {/* Ikon collapse/expand */}
                    </button>
                  )}
                 <span className="font-normal text-sm">{menu.menu_name}</span>

                </div>
                <div className="flex space-x-2">
                  <button
                    className="btn btn-outline btn-sm btn-primary hover:bg-blue-600"
                    onClick={() => handleEdit(menu)}
                  >
                    <i className="fa fa-pencil"></i>
                  </button>
                  <button
                    className="btn btn-outline btn-sm btn-error hover:bg-red-600"
                    onClick={() => handleDelete(menu.id)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
              {expandedMenus[menu.id] && menu.children.length > 0 && (
                <div className="ml-4 border-l-2 pl-2 border-gray-200">
                  {renderMenuTree(menu.children, level + 1, isLastItem)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };



  const filteredMenus = filterMenus(menus);

  return (
    <div className="container mx-auto p-4 bg-white text-black">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-rounded btn-primary" onClick={() => setIsModalOpen(true)}>
        Add Menu
       
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full max-w-xs pl-10"
          />
         
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        {filteredMenus.length > 0 ? renderMenuTree(filteredMenus) : 'No menus available'}
      </div>

      {isModalOpen && (
  <div className="modal modal-open">
    <div className="modal-box">
      <h2 className="font-bold text-lg">{selectedMenu ? 'Edit Menu' : 'Add Menu'}</h2>

      {/* Layout 2 kolom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <input
            type="text"
            placeholder="Menu Name"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            className="input input-bordered w-full mb-2"
            required
          />
        </div>

        <div className="form-control">
          <input
            type="text"
            placeholder="Icon Name"
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
            className="input input-bordered w-full mb-2"
          />
        </div>

        <div className="form-control">
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input input-bordered w-full mb-2"
          />
        </div>

        <div className="form-control">
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
            className="select select-accent w-full mb-2"
          >
            <option value="">Select Parent Menu</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.menu_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <input
            type="number"
            placeholder="Role ID"
            value={roleId || ''}
            onChange={(e) => setRoleId(e.target.value ? parseInt(e.target.value) : null)}
            className="input input-bordered w-full mb-2"
          />
        </div>

        <div className="form-control">
          <input
            type="number"
            placeholder="Icon ID"
            value={iconId || ''}
            onChange={(e) => setIconId(e.target.value ? parseInt(e.target.value) : null)}
            className="input input-bordered w-full mb-2"
          />
        </div>
      </div>

      <div className="modal-action mt-4">
        <button className="btn btn-primary" onClick={handleCreateOrUpdate}>
          {selectedMenu ? 'Update' : 'Create'}
        </button>
        <button className="btn btn-secondary" onClick={resetForm}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default MenuManager;
