#simple draft test file
import usb.core
import usb.util
dev = usb.core.find(idVendor=0x0483, idProduct=0xFFFF)
dev.set_configuration()
cfg = dev.get_active_configuration()
interface_number = cfg[(0,0)].bInterfaceNumber
alternate_setting = usb.control.get_interface(dev, interface_number)
intf = usb.util.find_descriptor(cfg, bInterfaceNumber = interface_number,bAlternateSetting = alternate_setting)
ep = usb.util.find_descriptor(intf, custom_match = lambda e:usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)
dev.read(ep.bEndpointAddress, ep.wMaxPacketSize)