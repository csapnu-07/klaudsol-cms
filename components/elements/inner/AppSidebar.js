import { FaFeatherAlt, FaRegUser, FaPlus } from 'react-icons/fa';
import { HiOutlineUser, HiOutlineUserGroup } from 'react-icons/hi';
import { BiPen } from 'react-icons/bi';
import { RiSettings3Line } from 'react-icons/ri';
import { AiOutlineLock } from 'react-icons/ai';
import React, { useState, useContext, useEffect, useRef } from 'react';
import 'simplebar/dist/simplebar.min.css'
import CacheContext from "@/components/contexts/CacheContext";
import AppModal from "@/components/klaudsolcms/AppModal";
import CollectionTypeBody from "@/components/klaudsolcms/modals/modal_body/CollectionTypeBody";
import { useRouter } from 'next/router'

// sidebar nav config
import FullSidebar from './sidebar/FullSidebar';
import CollapsedSidebar from './sidebar/CollapsedSidebar';
import { SET_COLLAPSE } from '@/lib/actions';
import RootContext from '@/components/contexts/RootContext';
import { useCapabilities } from '@/components/hooks';
import { writeSettings, writeContentTypes, readUsers,  readGroups } from "@/lib/Constants";

const AppSidebar = () => {

  const router = useRouter();
  const capabilities = useCapabilities();
  const formRef = useRef();
  const { state: rootState, dispatch: rootDispatch } = useContext(RootContext);

  const cache = useContext(CacheContext);
  const { firstName = null, lastName = null, defaultEntityType = null, entityTypes = [] } = cache ?? {};
  const [isCollectionTypeBodyVisible, setCollectionTypeBodyVisible] = useState(false);

  const [entityTypeLinks, setEntityTypeLinks] = useState([
  ]);

  const onModalSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
      setCollectionTypeBodyVisible(false);
    }
  };
  
  const [sidebarButtons, setSidebarButtons] = useState([
    ...entityTypes.map(type => ({
      title: type.entity_type_name,
      path: `/admin/content-manager/${type.entity_type_slug}`,
      icon: <BiPen className='sidebar_button_icon'/>
    })),
    (capabilities.includes(writeContentTypes) && {
      multiple: true,
      title: "Content Type Editor",
      path: `/admin/content-type-builder/`,
      icon: <FaFeatherAlt className='sidebar_button_icon'/>,
      subItems: [
        ...entityTypes.map(type => ({
        subTitle: `${type.entity_type_name} Type`,
        subPath: `/admin/content-type-builder/${type.entity_type_slug}`
      })),
      {
        subTitle: 'New Type',
        subPath: '#',
        subIcon:  <FaPlus className="content_create_icon" />,
        onClick: () => {setCollectionTypeBodyVisible(true)},
        highlight: false
      }
    ]
    }),
    {
      title: "Profile",
      path: "/admin/me",
      icon: <FaRegUser className='sidebar_button_icon'/>
    },
    (capabilities.includes(writeSettings) ? {
      title: "Settings",
      path: "/admin/settings",
      icon: <RiSettings3Line className='sidebar_button_icon'/>
    }:null),
    (false ? {
      multiple: true,
      title: "Admin",
      subItems:[capabilities.includes(readUsers) ?
                {subTitle:"Users", 
                 subIcon:<HiOutlineUser className='sidebar_button_icon'/>,
                 subPath:"/admin/users" 
                }: null,

                capabilities.includes(readGroups) ? 
                {subTitle:"Groups",
                 subIcon:<HiOutlineUserGroup className='sidebar_button_icon'/>,
                 subPath:"/admin/groups"
                } : null].filter(item => item),
      icon: <AiOutlineLock className='sidebar_button_icon'/>
    }:null)
  ].filter(item => item))

    /*** Entity Types List ***/
    useEffect(() => { 
     rootState.collapse === null ? rootDispatch({type: SET_COLLAPSE, payload: true}) : null
    }, [rootState.collapse]);
  
  return (
    <>
     {rootState.collapse ? <CollapsedSidebar entityTypeLinks={entityTypeLinks} sidebarButtons={[...entityTypeLinks, ...sidebarButtons]} firstName={firstName} lastName={lastName} defaultEntityType={defaultEntityType} router={router} setCollapse={e => rootDispatch({type: SET_COLLAPSE, payload: e})}/> : <FullSidebar sidebarButtons={sidebarButtons} firstName={firstName} lastName={lastName} defaultEntityType={defaultEntityType} router={router} setCollapse={e => rootDispatch({type: SET_COLLAPSE, payload: e})} />}
      <AppModal
        show={isCollectionTypeBodyVisible}
        onClose={() => setCollectionTypeBodyVisible(false)}
        onClick={onModalSubmit}
        modalTitle="Create a collection type"
        buttonTitle="Continue"
      >
        <CollectionTypeBody formRef={formRef} />
      </AppModal>
    </>
  )
}

export default React.memo(AppSidebar)
