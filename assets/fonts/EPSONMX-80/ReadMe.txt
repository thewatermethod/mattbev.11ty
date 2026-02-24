
For information on these fonts, see my web page for this font pack:

EPSON MX-80 Fonts By Michael Walden
 https://MW.Rat.bz/MX-80


License
-------
The EPSON MX-80 font files in this pack (.TTF, .OTF, .FON, etc.) are my own
work, hereby licensed under a Creative Commons Attribution-NonCommercial-
ShareAlike 4.0 International - CC BY-NC-SA 4.0 License.
https://CreativeCommons.org/licenses/by-nc-sa/4.0/
Attribution: By Michael Walden
Copyright: Transcribed and filled in by Michael Walden 2025 CC BY-NC-SA


EPSON MX-80 Font file creation steps
------------------------------------

Below are notes on how I created the fonts in the EPSON MX-80 Fonts font
pack.  There are more steps that I have omitted and I am saying that for now
those steps are outside the scope of this file.  I may expand with details
in a future revision of the font pack.

The following four files are text files that I started with to create my
fonts.  Open them in a text editor to see the text character data.

EPSON MX-80 F.xpm
EPSON MX-80 F Z.xpm
EPSON MX-80 F E.xpm
EPSON MX-80 F E Z.xpm

These files are images encoded in the XPM3 file format.  More information on
XPM3 files can be found on the following links:

X PixMap (XPM3) - Wikipedia
 https://en.Wikipedia.org/wiki/X_PixMap
XPM File Format Summary
 https://www.FileFormat.info/format/xpm/egff.htm
XPM Manual - The X PixMap Format - Version: 3.4i - September 10th 1996
 https://www.X.org/docs/XPM/xpm.pdf
libXpm (These are links that lead to the libxpm library)
 https://www.x.org/wiki/Releases/Download/
 https://www.x.org/releases/current/
 https://gitlab.freedesktop.org/xorg
 https://gitlab.freedesktop.org/xorg/lib
 https://gitlab.freedesktop.org/xorg/lib/libxpm  <<<<<<<<< HERE IT IS

I use these .XPM files with ImageMagic and convert them to .PNG files using the
following example ImageMagic commands:
 convert "EPSON MX-80 F.xpm" "EPSON MX-80 F.png"
 convert "EPSON MX-80 F Z.xpm" "EPSON MX-80 F Z.png"
 convert "EPSON MX-80 F E.xpm" "EPSON MX-80 F E.png"
 convert "EPSON MX-80 F E Z.xpm" "EPSON MX-80 F E Z.png"

The image in the .XPM file, which is converted into a .PNG file, is formatted as
described in the following text file:

How to Create Your Own Bitmap Font Writer Fonts.txt
(which is in the same folder as this ReadMe.txt file.)

If you want to get Bitmap Font Writer, go to the following url:

Bitmap Font Writer by Stefan Pettersson:  http://Stefan-Pettersson.nu/bmpfont

The following exceptions also need to be considered relative to the description
file above when working with Bitmap Font Writer Fonts for use with Fony:

When creating Bitmap Font Writer fonts for use with Fony, limit your color depth
to one bit per pixel black & white images.  Use white for the delimiter pixel
and for "on" pixels and use black for "off" pixels in you characters.  It is
recommended that you start each font at character 32 which represents a blank
space character.  You can use .PNG, .BMP, .JPG or .JPEG files with Fony, unlike
Bitmap Font Writer which only accepts .BMP files.  I recommend using .PNGs which
are losslessly compressed, unlike .BMP (which is not not compressed), .JPG and
.JPEG (which has lossy compression) files.

The .PNG files are now used as input to Fony by using:
File > Import > Bitmap Font Writer Font... > First Character: 32
 Basic Tab > Name: EPSON MX-80 F
                   EPSON MX-80 F Z
		   EPSON MX-80 F E
		   EPSON MX-80 F E Z
 Basic Tab > Copyright: Transcribed and filled in by Michael Walden 2025 CC BY-NC-SA
 Basic Tab > Ascent: 7
 Basic Tab > [/] Monospaced 
 More Tab > Charset: ANSI/Latin1/CP1252
 FON Tab > Module name: EPSON MX-80 F
                        EPSON MX-80 F Z
                        EPSON MX-80 F E
			EPSON MX-80 F E Z
 FON Tab > Description: EPSON MX-80 F
                        EPSON MX-80 F Z
                        EPSON MX-80 F E
			EPSON MX-80 F E Z

EPSON MX-80 F.png
EPSON MX-80 F Z.png
EPSON MX-80 F E.png
EPSON MX-80 F E Z.png

The following .FON files are then created using Fony:
File > Save As... >
 File name: EPSON MX-80 F.fon
            EPSON MX-80 F Z.fon
            EPSON MX-80 F E.fon
	    EPSON MX-80 F E Z.fon
 Save as type [FON font container (*.fon)]
 Click [Save]
They are Microsoft Windows bitmapped font files for use with Windows programs.

EPSON MX-80 F.fon
EPSON MX-80 F Z.fon
EPSON MX-80 F E.fon
EPSON MX-80 F E Z.fon

The following .FNT font files are then created using Fony:
Edit > Properties
 Basic Tab > Name: EPSON MX-80 T
                   EPSON MX-80 T Z
		   EPSON MX-80 T E
		   EPSON MX-80 T E Z
File > Save As > File name: EPSON MX-80 T.fnt
                            EPSON MX-80 T Z.fnt
			    EPSON MX-80 T E.fnt
			    EPSON MX-80 T E Z.fnt
                 Save as type [FNT font resource (*.fnt)]
 Click [Save]
They are Microsoft Windows bitmapped font resource files used as input to
Bits'n'Picas.

EPSON MX-80 T.fnt
EPSON MX-80 T Z.fnt
EPSON MX-80 T E.fnt
EPSON MX-80 T E Z.fnt

I use the above .FNT files as input into Bits'n'Picas using:
File > Open... > Select a File name: EPSON MX-80 T.fnt > Select an encoding such as windows-1252, Click [Open]
                                     EPSON MX-80 T Z.fnt
				     EPSON MX-80 T E.fnt
				     EPSON MX-80 T E Z.fnt
Double Click on "A" and move red (Em Ascent) and orange (X Height) horizontal lines to top edge of "A" and click [X]
File > Font Info
Font Family & Style Name: EPSON MX-80 T Normal
                          EPSON MX-80 T Z Normal
                          EPSON MX-80 T E Normal
			  EPSON MX-80 T E Z Normal
Font Family Name........: EPSON MX-80 T
                          EPSON MX-80 T Z
			  EPSON MX-80 T E
			  EPSON MX-80 T E Z
Font Style Name.........: Normal
Copyright Notice........: Transcribed and filled in by Michael Walden 2025 CC BY-NC-SA
Click [OK]
I then create the following temporary .TTF TrueType fonts using:
File > Export... > [TTF (TrueType) > [Export]
"EPSON MX-80 T TEMP.ttf" - Click [Save]
"EPSON MX-80 T Z TEMP.ttf"
"EPSON MX-80 T E TEMP.ttf"
"EPSON MX-80 T E Z TEMP.ttf"
File > Exit [Don't Save]

These temporary .TTF files need to be imported into FontForge to create new good
 looking .TTF files as follows:
Open Font > Specify temporary .TTF font file path and name > Click [OK]
                EPSON MX-80 T TEMP.ttf
		EPSON MX-80 T Z TEMP.ttf
		EPSON MX-80 T E TEMP.ttf
		EPSON MX-80 T E Z TEMP.ttf
Now, generate new .TTF files from FontForge as follows:

 Encoding > Reencode > Windows Latin ("ANSI")
 Element > Font Info...
 PS Names - EDIT AS NEEDED
   Fontname: EPSONMX-80T
             EPSONMX-80TZ
	     EPSONMX-80TE
	     EPSONMX-80TEZ
   Family Name: EPSON MX-80 T
                EPSON MX-80 T Z
		EPSON MX-80 T E
		EPSON MX-80 T E Z
   Name For Humans: EPSON MX-80 T Normal
                    EPSON MX-80 T Z Normal
                    EPSON MX-80 T E Normal
		    EPSON MX-80 T E Z Normal
   Weight: Medium
   Version: 2.0
   sfnt Revision: 2
   Copyright: Transcribed and filled in by Michael Walden 2025 CC BY-NC-SA
 OS/2 > Misc. > OS/2 Version [4]  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< THIS IS THE MAGIC SETTING TO CREATE GOOD TTF, OTF, WOFF and WOFF2 FONTS
 OS/2 > Metrics - EDIT AS NEEDED
   (I made no changes here)
 TTF Names - EDIT AS NEEDED
   UniqueID: EPSONMX-80T: 2025
             EPSONMX-80TZ: 2025
             EPSONMX-80TE: 2025
             EPSONMX-80TEZ: 2025
   Manufacturer: "" - Click [OK]
   Vendor URL: "" - Click [OK]
   (AT LEAST REMOVE http://www.kreativekorp.com/software/bitsnpicas/ OR REPLACE WITH WORKING URL: https://GitHub.com/kreativekorp/bitsnpicas )
 Click [OK]

File > Generate Fonts... "EPSON MX-80 T.ttf" (Select TrueType below file name) - Click [Generate]
                         "EPSON MX-80 T Z.ttf"
			 "EPSON MX-80 T E.ttf"
			 "EPSON MX-80 T E Z.ttf"
   Non-standard Em-Size
    (Element->Font Info->General dialog - Make Em-Size a Power of 2) - Click [Yes]
   Errors detected
    The font contains errors. Self Intersecting - Click [Generate]
Now they are TrueType font files for use with your operating system's programs.

With the .TTF files loaded in FontForge in the previous step, generate new .OTF files from FontForge as follows:
   Element > Font Info...
   PS Names - EDIT AS NEEDED
     Fontname: EPSONMX-80O
               EPSONMX-80OZ
               EPSONMX-80OE
	       EPSONMX-80OEZ
     Family Name: EPSON MX-80 O
                  EPSON MX-80 O Z
                  EPSON MX-80 O E
		  EPSON MX-80 O E Z
     Name For Humans: EPSON MX-80 O Normal
                      EPSON MX-80 O Z Normal
                      EPSON MX-80 O E Normal
		      EPSON MX-80 O E Z Normal
     Weight: Medium
     Version: 2.0
     sfnt Revision: 2
     Copyright: Transcribed and filled in by Michael Walden 2025 CC BY-NC-SA
   OS/2 > Misc. > OS/2 Version [4]  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< THIS IS THE MAGIC SETTING TO CREATE GOOD TTF, OTF, WOFF and WOFF2 FONTS
   OS/2 > Metrics - EDIT AS NEEDED
     (I made no changes here)
   TTF Names - EDIT AS NEEDED
     UniqueID: EPSONMX-80O: 2025
               EPSONMX-80OZ: 2025
	       EPSONMX-80OE: 2025
	       EPSONMX-80OEZ: 2025
     Manufacturer: "" - Click [OK]
     Vendor URL: "" - Click [OK]
     (AT LEAST REMOVE http://www.kreativekorp.com/software/bitsnpicas/ OR REPLACE WITH WORKING URL: https://GitHub.com/kreativekorp/bitsnpicas )
   Click [OK]
File > Generate Fonts... "EPSON MX-80 O.otf" (Select OpenType below file name) - Click [Generate]
                         "EPSON MX-80 O Z.otf"
                         "EPSON MX-80 O E.otf"
			 "EPSON MX-80 O E Z.otf"
The .OTF OpenType font files are for use with your operating system's programs.

EPSON MX-80 O.otf
EPSON MX-80 O Z.otf
EPSON MX-80 O E.otf
EPSON MX-80 O E Z.otf

With the .TTF files loaded in FontForge in the previous step, generate new .WOFF files from FontForge as follows:
   Element > Font Info...
   PS Names - EDIT AS NEEDED
     Fontname: EPSONMX-80W
               EPSONMX-80WZ
               EPSONMX-80WE
	       EPSONMX-80WEZ
     Family Name: EPSON MX-80 W
                  EPSON MX-80 W Z
                  EPSON MX-80 W E
		  EPSON MX-80 W E Z
     Name For Humans: EPSON MX-80 W Normal
                      EPSON MX-80 W Z Normal
                      EPSON MX-80 W E Normal
		      EPSON MX-80 W E Z Normal
   OS/2 > Misc. > OS/2 Version [4]
   OS/2 > Metrics - EDIT AS NEEDED
     (I made no changes here)
   TTF Names - EDIT AS NEEDED
     UniqueID: EPSONMX-80W: 2025
               EPSONMX-80WZ: 2025
               EPSONMX-80WE: 2025
	       EPSONMX-80WEZ: 2025
   Click [OK]
File > Generate Fonts... "EPSON MX-80 W.woff" (Select Web Open Font (WOFF) below file name) - Click [Generate]
                         "EPSON MX-80 W Z.woff"
                         "EPSON MX-80 W E.woff"
			 "EPSON MX-80 W E Z.woff"
File > Generate Fonts... ".woff2" (Select Web Open Font (WOFF2) below file name) - Click [Generate]
                         "EPSON MX-80 W.woff2"
                         "EPSON MX-80 W Z.woff2"
			 "EPSON MX-80 W E.woff2"
			 "EPSON MX-80 W E Z.woff2"
The following .WOFF & .WOFF2 Web Open Font files are for use with your web browser in web pages that you create.

EPSON MX-80 W.woff
EPSON MX-80 W.woff2
EPSON MX-80 W Z.woff
EPSON MX-80 W Z.woff2
EPSON MX-80 W E.woff
EPSON MX-80 W E.woff2
EPSON MX-80 W E Z.woff
EPSON MX-80 W E Z.woff2

The following eight files are demonstrations of how to load the Web Open Fonts in HTML files you create.

EPSON MX-80 W.woff Demo.htm
EPSON MX-80 W.woff2 Demo.htm
EPSON MX-80 W Z.woff Demo.htm
EPSON MX-80 W Z.woff2 Demo.htm
EPSON MX-80 W E.woff Demo.htm
EPSON MX-80 W E.woff2 Demo.htm
EPSON MX-80 W E Z.woff Demo.htm
EPSON MX-80 W E Z.woff2 Demo.htm

Tools used
----------
ImageMagick for text matrix (.xpm) to image (.png) conversion
 https://ImageMagick.org
Fony 1.4.7 by hukka for Bitmap font creation http://hukka.ncn.fi/?fony
Bits'n'Picas by Kreative Korp / Rebecca G. Bettencourt for Bitmap-to-outline
 vectorization https://GitHub.com/kreativekorp/bitsnpicas
FontForge by George Williams and the FontForge Project for TrueType font
 editing, fine-tuning, re-encoding etc. https://FontForge.org/en-US/

[]
