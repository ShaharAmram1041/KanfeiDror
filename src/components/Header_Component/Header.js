import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LoginButton from "../Login_Button_Component/LoginButton";
import LogoutButton from "../Logout_Button_Component/Logout_button";
import { auth, db } from "../../firebase_setup/firebase";
import { onAuthStateChanged } from "firebase/auth";
import classes from "./Header.module.scss";
import { collection, doc, getDoc } from "firebase/firestore";
import { BiMenuAltRight } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);
  const navigate =useNavigate();

  const checkUserRoles = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const adminRef = doc(collection(db, "AdminUsers"), user.email);
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists()) {
          console.log("You are admin!");
          setIsAdmin(true);
        } else {
          console.log("You are not adminUser.");
          setIsAdmin(false);
        }

        const regularRef = doc(collection(db, "RegularUsers"), user.email);
        const regularDoc = await getDoc(regularRef);
        if (regularDoc.exists()) {
          console.log("You are a RegularUser!");
          setIsRegularUser(true);
        } else {
          console.log("You are not a regular user.");
          setIsRegularUser(false);
        }
      } else {
        setIsAdmin(false);
        setIsRegularUser(false);
        console.log("User not logged in. isAdmin:", isAdmin);
      }
    } catch (error) {
      console.error("Error checking user roles:", error);
    }
  };

  useEffect(() => {
    checkUserRoles();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRoles();
      }
    });

    return () => unsubscribe();
  }, []);

  const [size, setSize] = useState({
    width: undefined,
    height: undefined,
  });

  const menuToggleHandler = () => {
    setMenuOpen((p) => !p);
  };

  const handleLogout= ()=>{
    setMenuOpen((p) => !p);
    navigate('/')
  }

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (size.width > 768 && menuOpen) {
      setMenuOpen(false);
    }
  }, [size.width, menuOpen]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
      } else {
        console.log("user is logged out");
      }
    });
  }, []);

  

  return (
    <header className={classes.header}>
      <div className={classes.header__content}>
        <NavLink to="/" className={classes.header__content__logo}>
          כנפי
          <br />
          דרור
        </NavLink>
        <nav
          className={`${classes.header__content__nav} ${
            menuOpen && size.width < 768 ? classes.isMenu : ""
          }`}
        >
          <ul>
            <li>
              <NavLink to="/FollowSingleReportPage" onClick={menuToggleHandler}>
                מעקב אחרי דיווח
              </NavLink>
            </li>
            <li>
              <NavLink to="/" onClick={menuToggleHandler}>
                מסך הבית
              </NavLink>
            </li>

            {auth.currentUser && (
            
            <li>
              <NavLink to="/ReportsTable" onClick={menuToggleHandler}>
                ניהול דיווחים
              </NavLink>
            </li>
            )}


            {isAdmin && auth.currentUser && (
  <>
    <li>
      <NavLink to="/AddAdministrator"  onClick={menuToggleHandler}>הוספת משתמש</NavLink>
    </li>
    <li>
      <NavLink to="/RemoveAdministrator"  onClick={menuToggleHandler}>הסרת משתמש</NavLink>
    </li>
  </>
)}

            <li>
              {auth.currentUser ? (
                <LogoutButton onClick={menuToggleHandler} />
              ) : (
                <LoginButton onClick={handleLogout} />
              )}
            </li>
          </ul>
        </nav>
        <div className={classes.header__content__toggle}>
          {!menuOpen ? (
            <BiMenuAltRight onClick={menuToggleHandler} />
          ) : (
            <AiOutlineClose onClick={menuToggleHandler} />
          )}
        </div>
      </div>
    </header>
  );
}