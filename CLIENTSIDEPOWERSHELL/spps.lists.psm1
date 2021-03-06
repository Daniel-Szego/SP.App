#----------------------------------------------------------------------------- 
# Filename : spps.lists.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Contains methods to manage lists, document libraries and list items.

###################
#    Retrieval 
###################

function Get-List
{
[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $ListTitle
	)

get-lists

if($ListTitles.Title -contains $ListTitle)
{
$listid = $listTitles| Where-Object {$_.Title -eq $listTitle} | select ID
$listidtoLoad = $listid.ID.GUID
$Global:list = $lists.GetByID($Listidtoload)
$spps.Load($list)
$spps.ExecuteQuery()
Write-host "Variable" -ForegroundColor Green -NoNewline
Write-host ' $List ' -ForegroundColor Red -NoNewline
Write-host "is now in use for the list"$ListTitle"" -ForegroundColor Green
$global:listconstant = "1"
}
else
{
Write-Host "List $listTitle Doesn't Exist" -ForegroundColor Red
$global:listconstant = "0"
}
}

function Get-Lists
{
Get-Web
$Global:lists = $web.lists
$spps.Load($lists)
$spps.ExecuteQuery()
$Global:listtitles = $lists | select Title,ID
}  

function Get-ListItems
{
[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $ListName
	)
Get-List -listname $listname
$query = [Microsoft.SharePoint.Client.CamlQuery]::CreateAllItemsQuery(100, "ID", "Title")
$global:listItems = $list.GetItems( $query )
$spps.Load($listItems)
$spps.ExecuteQuery()
}     

###################
#     Additions
###################

function Add-List
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$listTitle,
		
		[Parameter(Mandatory=$false, Position=1)]
		[Microsoft.SharePoint.Client.ListTemplateType]$templateType = "genericList",

        [Parameter(Mandatory=$false, Position=1)]
		[String]$Description,

        [Parameter(Mandatory=$false, Position=1)]
		[ValidateSet("Off", "On", "DefaultValue")]
        [Microsoft.SharePoint.Client.QuickLaunchOptions]$QuickLaunch = "DefaultValue",

		[Parameter(Mandatory=$false, Position=1)]
		[bool]$Hidden
      
	)
	     get-lists
    if(!($listTitles.Title -contains $listTitle))
    {
        $listCreationInfo = new-object Microsoft.SharePoint.Client.ListCreationInformation
        $listCreationInfo.TemplateType = $templateType
        $listCreationInfo.Title = $listTitle
        $listCreationInfo.QuickLaunchOption = $QuickLaunch
        $listCreationInfo.Description = $Description
        $list = $web.Lists.Add($listCreationInfo)
         
        $spps.ExecuteQuery()
        
		if ($Hidden -ne $false)
		{
			$list.Hidden = $true;
			$list.Update()
	        $spps.ExecuteQuery()
		}

		       
		Write-Host "List '$listTitle' is created succesfully" -foregroundcolor black -backgroundcolor green
    }
    else
    {
		Write-Host "List '$listTitle' already exists" -foregroundcolor black -backgroundcolor yellow
    }

   
    Get-lists #Update
}

function Add-DocumentLibrary
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$listTitle
	)
	
    Add-List -listTitle $listTitle -templateType "DocumentLibrary"
}

function Add-PictureLibrary
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$listTitle
	)
	
	Add-List -listTitle $listTitle -templateType "PictureLibrary"
}


function Add-FieldsToList
{
	<#
	.SYNOPSIS
		Adds custom fields to the list
	.DESCRIPTION
		Fill the $fields property using an array of array (<fieldname>,<fieldtype>,<optional>)
		where fieldtypes are:
			Text
            Note
            DateTime
            Currency
            Number
            Choice (add choices comma-seperated to optional field)
            Person or Group
            Calculated (add expression to optional field)
	.PARAMETER fields
		Use an array of array (<fieldname>,<fieldtype>,<optional>)
		where fieldtypes are:
			Text
            Note
            DateTime
            Currency
            Number
            Choice (add choices comma-seperated to optional field)
            Person or Group
            Calculated (add expression to optional field)
	.PARAMETER listTitle
		Title of the list
	.EXAMPLE
		[string[][]]$fields = ("MyChoices","Choice","Left;Right"),
                              ("MyNumber","Number","")
	#>
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string[][]]$fields,
		
		[Parameter(Mandatory=$true, Position=2)]
		[string]$listTitle
	)
	
    foreach($field in $fields)
    {
        $fieldName = $field[0]
        $fieldType = $field[1]
        $fieldValue = $field[2]
        
        switch ($fieldType)
        {
            "Text"
            {
                Add-TextFieldtoList $listTitle $fieldName
            }
            "Note"
            {
                Add-NoteFieldtoList $listTitle $fieldName
            }
            "DateTime"
            {
                Add-DateTimeFieldtoList $listTitle $fieldName
            }
            "Currency"
            {
                Add-CurrencyFieldtoList $listTitle $fieldName
            }
            "Number"
            {
                Add-CurrencyFieldtoList $listTitle $fieldName
            }
            "Choice"
            {
                Add-ChoiceFieldtoList $listTitle $fieldName $fieldValue
            }
            "Person or Group"
            {
                Add-UserFieldtoList $listTitle $fieldName
            }
            "Calculated"
            {
                Add-CalculatedFieldtoList $listTitle $fieldName $fieldValue
            }
        }
    }
}

function Add-CalculatedFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle,
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,
		
		[Parameter(Mandatory=$true, Position=3)]
		[string] $value
	)
	
    $refField = $value.Split(";")[1]
    $formula = $value.Split(";")[0]
    
    $internalName = Find-FieldName $listTitle $refField
    
    $newField = '<Field Type="Calculated" DisplayName="$fieldName" ResultType="DateTime" ReadOnly="TRUE" Name="$fieldName"><Formula>$formula</Formula><FieldRefs><FieldRef Name="$internalName" /></FieldRefs></Field>'
    
    Add-Field $listTitle $fieldName $newField          
}

function Add-UserFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,
        
        [Parameter(Mandatory=$true, Position=2)]
		[ValidateSet("Single","Multi")]
        [string] $Usertype,
        
        [Parameter(Mandatory=$true, Position=2)]
		[string] $UserSelectionScope = "0",

        [Parameter(Mandatory=$true, Position=2)]
		[ValidateSet("PeopleOnly","PeopleAndGroups")]
        [string] $UserSelectionMode,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues = "FALSE",

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)
	
if($Usertype -eq "Single")
{
$fieldtype = "User"
$Mult = $null
}
Elseif($Usertype -eq "Multi")
{
$fieldtype = "UserMulti" 
$Mult= "Mult='TRUE'"
$indexed = "FALSE"
Write-host "Indexing on Multi User Fields Isn't Supported"
}

    $global:newField = "<Field Type='$fieldtype' DisplayName='$fieldName' Name='$fieldName' StaticName='$fieldName' UserSelectionScope='$userSelectionScope' UserSelectionMode='$userSelectionMode' $mult Sortable='FALSE' required='$Required' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed'/>"
    Add-Field $listTitle $fieldName $newField  
}

function Add-TextFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$false, Position=2)]
		[int] $MaxNumberofChars,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)
	
if(!$MaxNumberofChars)
{
$MaxNumberofChars = "255"
}
    $newField = "<Field Type='Text' DisplayName='$fieldName' Name='$fieldName' MaxLength='$MaxNumberofChars' required='$requried' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed' />"
    Add-Field $listTitle $fieldName $newField  
}

function Add-NoteFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$true, Position=2)]
		[INT] $NumberOfLines,

        [Parameter(Mandatory=$true, Position=2)]
		[ValidateSet("RichText","EnhancedRichText","PlainText")]
        [string] $TextType,
        
        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues
        
	)

if($TextType -eq "RichText")
{
$ttype = 'RichText="TRUE" RichTextMode="Compatible"'
}
elseif($TextType -eq "EnhancedRichText")
{
$ttype = 'RichText="TRUE" RichTextMode="FullHtml"'
}
Elseif($TextType -eq "PlainText")
{
$ttype = 'RichText="False"'
}
	
    $newField = "<Field Type='Note' DisplayName='$fieldName' Name='$fieldName' NumLines='$NumberofLines' $ttype Sortable='FALSE' required='$requried' EnforceUniqueValues='$enforceUniqueValues' />"
    Add-Field $listTitle $fieldName $newField  
}

function Add-DateTimeFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)
	
    $newField = "<Field Type='DateTime' DisplayName='$fieldName' Name='$fieldName' required='$requried' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed'/>"
    Add-Field $listTitle $fieldName $newField  
}

function Add-CurrencyFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)
	
    $newField = "<Field Type='Currency' DisplayName='$fieldName' Name='$fieldName' required='$requried' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed'/>"
    Add-Field $listTitle $fieldName $newField  
}

function Add-NumberFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)

    $newField = "<Field Type='Number' DisplayName='$fieldName' Name='$fieldName' required='$requried' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed'/>"
    Add-Field $listTitle $fieldName $newField  
}


function Add-BooleanFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,

        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed
	)

    $newField = "<Field Type='Boolean' DisplayName='$fieldName' Name='$fieldName' required='$requried' Indexed='$indexed' />"
    Add-Field $listTitle $fieldName $newField  
}


function Add-ChoiceFieldtoList
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName,
		
		[Parameter(Mandatory=$true, Position=3)]
		[string] $values,
        
        [Parameter(Mandatory=$true, Position=4)]
		[ValidateSet("Dropdown","MultiChoice","RadioButtons")]
        [string] $ChoiceType,
        
        [Parameter(Mandatory=$false, Position=5)]
		[ValidateSet("TRUE","FALSE")]
        [String] $Required,

        [Parameter(Mandatory=$false, Position=6)]
		[ValidateSet("TRUE","FALSE")]
        [String] $enforceUniqueValues,

        [Parameter(Mandatory=$false, Position=7)]
		[ValidateSet("TRUE","FALSE")]
        [String] $indexed

	)
	
if($ChoiceType -eq "MultiChoice")
{
$ftype = "MultiChoice"
$cType = $null
}
else
{
$ftype = "Choice"
$ctype = $ChoiceType
}

    $options = ""
    $valArray = $values.Split(";")
    foreach ($s in $valArray)
    {
        $options = $options + "<CHOICE>$s</CHOICE>"
    }
    
    $newField = "<Field Type='$fType' DisplayName='$fieldName' Name='$fieldName' Format='$cType' required='$requried' EnforceUniqueValues='$enforceUniqueValues' Indexed='$indexed' ><CHOICES>$options</CHOICES></Field>"
    
    Add-Field $listTitle $fieldName $newField  
}


function Add-ChoicesToField
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string[]] $choices, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName, 
		
		[Parameter(Mandatory=$true, Position=3)]
		[string] $listTitle
	)

	Write-Host "Adding choices to field $fieldName" -foregroundcolor black -backgroundcolor yellow
    $web = $spps.Web
    $list = $web.Lists.GetByTitle($listTitle)
    $fields = $list.Fields
    $spps.Load($fields)
    $spps.ExecuteQuery()

    if (Test-Field $list $fields $fieldName)
    {
        $field = $fields.GetByInternalNameOrTitle($fieldName)
        $spps.Load($field)
        $spps.ExecuteQuery()
        
        # calling nongeneric method public T CastTo<T>(ClientObject object)
        $method = [Microsoft.Sharepoint.Client.ClientContext].GetMethod("CastTo")
        $castToMethod = $method.MakeGenericMethod([Microsoft.Sharepoint.Client.FieldChoice])
        $fieldChoice = $castToMethod.Invoke($spps, $field)
        
        $currentChoices = $fieldChoice.Choices
        
        # add new choices to the existing choices
        $allChoices = $currentChoices + $choices
        
        # write choices back to the field
        $fieldChoice.Choices = $allChoices
        $fieldChoice.Update()
        
        $list.Update()
        $spps.ExecuteQuery()
		Write-Host "Choices added to field $fieldName" -foregroundcolor black -backgroundcolor yellow
    }
    else
    {
		Write-Host "Field $fieldName doesn't exists in list $listTitle" -foregroundcolor black -backgroundcolor red
    }
}

function Add-BulkFieldstoList 
{
[CmdletBinding()]
	param
	(
	    [Parameter(Mandatory=$true, Position=1)]
	    [string]$ListTitle,
		
        [Parameter(Mandatory=$false,HelpMessage="Csv File Location", Position=2)]
	    $CSVFile 
    )
$csv = import-csv $CSVFile
get-list -ListTitle $ListTitle
foreach($row in $csv)
{
if($row.type -eq "Choice")
{
Add-ChoiceFieldtoList -listTitle $list.Title -fieldName $Row.Name -values $row.Choicevalues -ChoiceType $row.ChoiceType
}
if($row.type -eq "Text")
{
Add-textFieldtoList -listTitle $list.Title -fieldName $row.Name -MaxNumberofChars $row.TextMaxChars
}
if($row.type -eq "Note")
{
Add-NoteFieldtoList -listTitle $list.Title -fieldName $row.Name -NumberOfLines $row.NoteLines -TextType $row.NoteType
}
if($row.type -eq "User")
{
Add-UserFieldtoList -listTitle $list.title -fieldName $row.Name -Usertype $row.UserType -UserSelectionScope $row.UserSelectionScope -UserSelectionMode $row.UserSelectionMode
}
if($row.type -eq "Calculated")
{
Add-CalculatedFieldtoList -listTitle $list.Title -fieldName $row.name -value $row.CalcValue
}
if($row.type -eq "DateTime")
{
Add-DateTimeFieldtoList -listTitle $list.title -fieldName $row.Name
}
if ($row.type -eq "Currency")
{
Add-CurrencyFieldtoList -listTitle $list.Title -fieldName $row.name 
}
if ($row.type -eq "Number")
{
Add-NumberFieldtoList -listTitle $list.Title -fieldName $row.name
}
if ($row.type -eq "Boolean")
{
Add-BooleanFieldtoList -listTitle $list.Title -fieldName $row.name 
}
}
}
  
        
function Add-Field
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $fieldName, 
		
		[Parameter(Mandatory=$true, Position=3)]
		[string] $fieldXML
	)

    $web = $spps.Web
    $list = $web.Lists.GetByTitle($listTitle)
    $fields = $list.Fields
    $spps.Load($fields)
    $spps.ExecuteQuery()

    if (!(Test-Field $list $fields $fieldName))
    {
        $field = $list.Fields.AddFieldAsXml($fieldXML, $true, [Microsoft.SharePoint.Client.AddFieldOptions]::AddToAllContentTypes);
        $list.Update()
        $spps.ExecuteQuery()
        
		Write-Host "Field $fieldName added to list $listTitle" -foregroundcolor black -backgroundcolor yellow
    }
    else
    {
		Write-Host "Field $fieldName already exists in list $listTitle" -foregroundcolor black -backgroundcolor yellow
    }
}


function Find-FieldName
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string] $listTitle, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string] $displayName
	)

    Get-List -ListName $listTitle
    $fields = $list.Fields
    $spps.Load($fields)
    $spps.ExecuteQuery()

    $fieldValues = $fields | select Title, InternalName
    foreach($f in $fieldValues)
    {
        if ($f.Title -eq $displayName)
        {
            return $f.InternalName
        }
    }
    
    return $displayName;
}
  

function Test-Field
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[Microsoft.SharePoint.Client.List] $list, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[Microsoft.SharePoint.Client.FieldCollection] $fields, 
		
		[Parameter(Mandatory=$true, Position=3)]
		[string] $fieldName
	)
	
    $fieldNames = $fields | select Title
    $exists = ($fieldNames -contains $fieldName)
    return $exists
}


### FOLDER COPYING FUNCTIONS ###

function Copy-Folder
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$folderPath, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string]$doclib, 
		
		[Parameter(Mandatory=$false, Position=3)]
		[bool]$checkoutNecessary = $false
	)

    # for each file in folder Copy-File()
    $files = Get-ChildItem -Path $folderPath -Recurse
    foreach ($file in $files)
    {
        $folder = $file.FullName.Replace($folderPath,'')
        $targetPath = $doclib + $folder
        $targetPath = $targetPath.Replace('\','/')
        Copy-File $file $targetPath $checkoutNecessary
    }
}

function Copy-File
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[System.IO.FileSystemInfo]$file, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string]$targetPath, 
		
		[Parameter(Mandatory=$true, Position=3)]
		[bool]$checkoutNecessary
	)

    if ($file.PsIsContainer)
    {
        Add-Folder $targetPath
    }
    else
    {
        $filePath = $file.FullName
        
		Write-Host "Copying file $filePath to $targetPath" -foregroundcolor black -backgroundcolor yellow
		
        
        if ($checkoutNecessary)
        {
            # Set the error action to silent to try to check out the file if it exists
            $ErrorActionPreference = "SilentlyContinue"
            Submit-CheckOut $targetPath
            $ErrorActionPreference = "Stop"
        }
        
		$arrExtensions = ".html", ".js", ".master", ".txt", ".css", ".aspx"
		
		if ($arrExtensions -contains $file.Extension)
		{
			$tempFile = Convert-FileVariablesToValues -file $file
	        Save-File $targetPath $tempFile
		} 
		else
		{
			Save-File $targetPath $file
		}
        
        if ($checkoutNecessary)
        {
            Submit-CheckOut $targetPath
            Submit-CheckIn $targetPath
        }
    }
}

function Save-File
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$targetPath, 
	
		[Parameter(Mandatory=$true, Position=2)]
		[System.IO.FileInfo]$file
	)
	
	$targetPath = Join-Parts -Separator '/' -Parts $spps.Web.ServerRelativeUrl, $targetPath
	
    $fs = $file.OpenRead()
    [Microsoft.SharePoint.Client.File]::SaveBinaryDirect($spps, $targetPath, $fs, $true)
    $fs.Close()
}

function Add-Folder
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$folderUrl
	)
	
    # folder name
    $folderNameArr = $folderurl.Split('/')
    $folderName = $folderNameArr[$folderNameArr.length-1]
	# get server relative path of the sitecollection in there and remove the folder, cause thats being created right now
    $folderUrl = Join-Parts -Separator '/' -Parts $spps.Web.ServerRelativeUrl, $folderUrl
	$parentFolderUrl = $folderUrl.Replace('/' + $folderName,'')
    
 	
 
    # load the folder
    $web = $spps.Web
    $folder = $web.GetFolderByServerRelativeUrl($folderUrl)
    $spps.Load($folder)
    $alreadyExists = $false
 
    # check if the folder exists
    try
    {
        $spps.ExecuteQuery();
        # test if the folder already exists by checking its Path property
        if ($folder.Path)
        {
            $alreadyExists = $true;
        }
    }
    catch { }
 
    if (!$alreadyExists)
    {
        # folder doesn't exists so create it
		Write-Host "Create folder $folderName at $parentFolderUrl" -foregroundcolor black -backgroundcolor yellow
        
        # create the folder item
        $newItemInfo = new-object Microsoft.SharePoint.Client.ListItemCreationInformation
        $newItemInfo.UnderlyingObjectType = [Microsoft.SharePoint.Client.FileSystemObjectType]::Folder
        $newItemInfo.LeafName = $folderName
        $newItemInfo.FolderUrl = $parentFolderUrl
        
        # add the folder to the list
        $listUrl = Join-Parts -Separator '/' -Parts $spps.Web.ServerRelativeUrl, $folderNameArr[1]
		
		
		#$spps.LoadQuery($web.Lists.Where(list => list.RootFolder.ServerRelativeUrl -eq $listUrl))
		
		$method = [Microsoft.SharePoint.Client.ClientContext].GetMethod("Load")
		$loadMethod = $method.MakeGenericMethod([Microsoft.SharePoint.Client.List])

		$parameter = [System.Linq.Expressions.Expression]::Parameter(([Microsoft.SharePoint.Client.List]), "list")
		$expression = [System.Linq.Expressions.Expression]::Lambda(
			[System.Linq.Expressions.Expression]::Convert(
				[System.Linq.Expressions.Expression]::PropertyOrField(
					[System.Linq.Expressions.Expression]::PropertyOrField($parameter, "RootFolder"),
					"ServerRelativeUrl"
				),
				[System.Object]
			),
			$($parameter)
		)
		$expressionArray = [System.Array]::CreateInstance($expression.GetType(), 1)
		$expressionArray.SetValue($expression, 0)
		
		$lists = $web.Lists
		
		$spps.Load($lists)
		$spps.ExecuteQuery()
		
		$list = $null
		
		foreach	($listfinder in $lists) {
			$loadMethod.Invoke($spps, @($listfinder, $expressionArray))
			
			$spps.ExecuteQuery()
			
			if ($listfinder.RootFolder.ServerRelativeUrl -eq $listUrl)
			{
				$list = $listfinder
			}
		}
		
        $newListItem = $list.AddItem($newItemInfo)
 
        # item update
        $newListItem.Update()
 
        # execute it
        $spps.Load($list);
        $spps.ExecuteQuery();
    }
}



### LIST OPERATIONS ###

function Add-ListItems
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$csvPath, 
		
		[Parameter(Mandatory=$true, Position=2)]
		[string]$listName
	)

    $list = $spps.Web.Lists.GetByTitle($listName)
    
    $csvPathUnicode = $csvPath -replace ".csv", "_unicode.csv"
    Get-Content $csvPath | Out-File $csvPathUnicode
    $csv = Import-Csv $csvPathUnicode -Delimiter ';'
    foreach ($line in $csv)
    {
        $itemCreateInfo = new-object Microsoft.SharePoint.Client.ListItemCreationInformation
        $listItem = $list.AddItem($itemCreateInfo)
        
        foreach ($prop in $line.psobject.properties)
        {
            $listItem[$prop.Name] = $prop.Value
        }
        
        $listItem.Update()
        
        $spps.ExecuteQuery()
    }
}


### CHECKIN CHECKOUT FUNCTIONS ###

function Submit-CheckOut
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$targetPath
	)
	
	$targetPath = Join-Parts -Separator '/' -Parts $spps.Web.ServerRelativeUrl, $targetPath

    $remotefile = $spps.Web.GetFileByServerRelativeUrl($targetPath)
    $spps.Load($remotefile)
    $spps.ExecuteQuery()
    
    if ($remotefile.CheckOutType -eq [Microsoft.SharePoint.Client.CheckOutType]::None)
    {
        $remotefile.CheckOut()
    }
    $spps.ExecuteQuery()
}

function Submit-CheckIn
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$targetPath
	)
	
	$targetPath = Join-Parts -Separator '/' -Parts $spps.Web.ServerRelativeUrl, $targetPath
	
    $remotefile = $spps.Web.GetFileByServerRelativeUrl($targetPath)
    $spps.Load($remotefile)
    $spps.ExecuteQuery()
    
    $remotefile.CheckIn("",[Microsoft.SharePoint.Client.CheckinType]::MajorCheckIn)
    
    $spps.ExecuteQuery()
}



###################
#       Removals
###################

function Clear-ListContent
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[string]$listTitle
	)
	
    $web = $spps.Web
    $list = $web.Lists.GetByTitle($listTitle)

    $spps.Load($list)
    $spps.ExecuteQuery()
    
    $count = $list.ItemCount
    $newline = [environment]::newline

    
    Write-Host -NoNewline "Deleting listitems from $listTitle" -foregroundcolor black -backgroundcolor yellow

	$continue = $true
    while($continue)
    {
        Write-Host -NoNewline "." -foregroundcolor black -backgroundcolor yellow
       	$query = [Microsoft.SharePoint.Client.CamlQuery]::CreateAllItemsQuery(100, "ID")
        $listItems = $list.GetItems( $query )

        $spps.Load($listItems)
        $spps.ExecuteQuery()
        
        if ($listItems.Count -gt 0)
        {
            for ($i = $listItems.Count-1; $i -ge 0; $i--)
            {
                $listItems[$i].DeleteObject()
            } 
            $spps.ExecuteQuery()
        }
        else
        {
			Write-Host "." -foregroundcolor black -backgroundcolor yellow
            $continue = $false;
        }
    }

    Write-Host "All listitems deleted from $listTitle." -foregroundcolor black -backgroundcolor green



} 



function Remove-list
{
[CmdletBinding()]
	param
	(
	    [Parameter(Mandatory=$true, Position=1)]
	    [string]$ListTitle 
    )
    Get-List -ListTitle $ListTitle
    if($listconstant -eq "1")
    {
    $list.DeleteObject()
    $spps.ExecuteQuery()
    Write-host "List $ListTitle Sucessfully Removed" -ForegroundColor Green
    }
    $list = $null
    get-lists
   }





