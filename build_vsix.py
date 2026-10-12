#!/usr/bin/env python3
"""
NormaHub VSIX Packager:
Constructs a valid, production-compliant Open Packaging Convention (OPC) .vsix archive
ready for instant installation in Cursor, VS Code, Windsurf, and upload to Open-VSX / Marketplace.
"""

import json
import os
import sys
import zipfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def build_vsix():
    print(f"Building VSIX package from {BASE_DIR}...")
    pkg_path = os.path.join(BASE_DIR, "package.json")
    with open(pkg_path, "r", encoding="utf-8") as f:
        pkg = json.load(f)
        
    name = pkg.get("name", "normahub-ai-gateway")
    version = pkg.get("version", "1.1.0")
    publisher = pkg.get("publisher", "normahub")
    output_vsix = os.path.join(BASE_DIR, f"{name}-{version}.vsix")
    display_name = pkg.get("displayName", "NormaHub AI Gateway")
    description = pkg.get("description", "")
    categories = ",".join(pkg.get("categories", ["AI"]))
    tags = ",".join(pkg.get("keywords", ["normahub", "openai", "cursor"]))

    # 2. Generate [Content_Types].xml
    content_types_xml = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
</Types>
"""

    # 3. Generate extension.vsixmanifest
    vsix_manifest_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Id="{name}" Version="{version}" Publisher="{publisher}"/>
    <DisplayName>{display_name}</DisplayName>
    <Description>{description}</Description>
    <Icon>extension/icon.png</Icon>
    <Categories>{categories}</Categories>
    <Tags>{tags}</Tags>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.85.0"/>
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value=""/>
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value=""/>
      <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value=""/>
    </Properties>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true"/>
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/icon.png" Addressable="true"/>
  </Assets>
</PackageManifest>
"""

    files_to_pack = [
        ("package.json", "extension/package.json"),
        ("dist/extension.js", "extension/dist/extension.js"),
        ("README.md", "extension/README.md"),
        ("icon.png", "extension/icon.png"),
        ("media/normahub-icon.svg", "extension/media/normahub-icon.svg")
    ]

    # Verify all files exist
    for src, _ in files_to_pack:
        p = os.path.join(BASE_DIR, src)
        if not os.path.exists(p):
            print(f"Error: Required file missing: {p}", file=sys.stderr)
            sys.exit(1)

    # 4. Create ZIP/VSIX
    with zipfile.ZipFile(output_vsix, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml)
        zf.writestr("extension.vsixmanifest", vsix_manifest_xml)
        for src, arcname in files_to_pack:
            zf.write(os.path.join(BASE_DIR, src), arcname)

    size_kb = round(os.path.getsize(output_vsix) / 1024, 1)
    print(f"✓ VSIX package successfully built: {output_vsix} ({size_kb} KB)")
    print("\nInstall via Cursor:")
    print(f"  cursor --install-extension {output_vsix}")
    print("\nInstall via VS Code:")
    print(f"  code --install-extension {output_vsix}")

if __name__ == "__main__":
    build_vsix()
