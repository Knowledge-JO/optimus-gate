import { TbLayoutDashboard } from "react-icons/tb";
import { VscLayers } from "react-icons/vsc";
import { FiUsers } from "react-icons/fi";
import { IoSyncOutline } from "react-icons/io5";
import { GoArrowSwitch } from "react-icons/go";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { LuExternalLink } from "react-icons/lu";
// import { LiaCreditCard } from "react-icons/lia";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";

export const navItem = [
  {
    name: "Overview",
    slug: "overview",
    icon: TbLayoutDashboard,
  },
  {
    name: "Plan",
    slug: "plan",
    icon: VscLayers,
  },
  {
    name: "Subscribers",
    slug: "subscribers",
    icon: FiUsers,
  },
  {
    name: "Subscriptions",
    slug: "subscriptions",
    icon: IoSyncOutline,
  },
  {
    name: "Transactions",
    slug: "transactions",
    icon: GoArrowSwitch,
  },
  {
    name: "Refunds",
    slug: "refunds",
    icon: BsArrowCounterclockwise,
  },
  {
    name: "Payouts",
    slug: "payouts",
    icon: LuExternalLink,
  },
  // {
  //   name: "Subaccount",
  //   slug: "subaccount",
  //   icon: LiaCreditCard,
  // },
];

export const bottomNav = [
  {
    name: "Settings",
    slug: "settings",
    icon: IoSettingsOutline,
  },
  {
    name: "Logout",
    slug: "logout",
    icon: LuLogOut,
  },
];
