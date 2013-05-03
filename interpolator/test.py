#simple draft test file
import usb.core
import usb.util
dev = usb.core.find(idVendor=0x0483, idProduct=0xFFFF)
dev.set_configuration()
cfg = dev.get_active_configuration()
interface_number = cfg[(0,0)].bInterfaceNumber
intf = usb.util.find_descriptor(cfg, bInterfaceNumber = interface_number)
ep = usb.util.find_descriptor(intf, custom_match = lambda e:usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)
ep2 = usb.util.find_descriptor(intf, custom_match = lambda e:usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)
dev.read(ep.bEndpointAddress, ep.wMaxPacketSize)